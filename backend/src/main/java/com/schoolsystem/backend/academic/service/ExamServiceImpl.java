package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.request.CreateExamRequest;
import com.schoolsystem.backend.academic.dto.request.UpdateExamRequest;
import com.schoolsystem.backend.academic.dto.response.ExamResponseDTO;
import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import com.schoolsystem.backend.academic.repository.ExamRepository;
import com.schoolsystem.backend.academic.repository.MarkRepository;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.academic.dto.request.CreateExamWithTimetableRequest;
import com.schoolsystem.backend.academic.dto.request.ExamSlotItemRequest;
import com.schoolsystem.backend.academic.dto.response.ExamWithTimetableResponseDTO;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.timetable.dto.response.ExamConflictCheckResponse;
import com.schoolsystem.backend.timetable.dto.response.ExamScheduleResponse;
import com.schoolsystem.backend.timetable.model.CampusFacility;
import com.schoolsystem.backend.timetable.model.ExamSchedule;
import com.schoolsystem.backend.timetable.repository.ExamScheduleRepository;
import com.schoolsystem.backend.timetable.service.ExamConflictService;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ExamScheduleRepository examScheduleRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ExamConflictService conflictService;
    private final MarkRepository markRepository;

    public ExamServiceImpl(ExamRepository examRepository,
                           SchoolClassRepository schoolClassRepository,
                           ExamScheduleRepository examScheduleRepository,
                           SubjectRepository subjectRepository,
                           UserRepository userRepository,
                           ExamConflictService conflictService,
                           MarkRepository markRepository) {
        this.examRepository = examRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.examScheduleRepository = examScheduleRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.conflictService = conflictService;
        this.markRepository = markRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDTO> getAllExams(Integer academicYear, ExamTerm term, Long classId, ExamStatus status) {
        List<Exam> exams = examRepository.searchExams(academicYear, term, classId, status);
        return exams.stream()
                .map(ExamResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponseDTO getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id, "EXAM_NOT_FOUND"));
        return ExamResponseDTO.fromEntity(exam);
    }

    @Override
    public ExamResponseDTO createExam(CreateExamRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        SchoolClass schoolClass = null;
        if (request.getClassId() != null) {
            schoolClass = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId(), "CLASS_NOT_FOUND"));
        }

        ExamTerm term = request.getTerm() != null ? request.getTerm() : ExamTerm.OTHER;
        ensureNameMatchesGrade(request.getName(), schoolClass != null ? schoolClass.getGradeLevel() : null);
        ensureTermExamAvailable(schoolClass, request.getAcademicYear(), term, null);

        Exam exam = new Exam(
                request.getName(),
                request.getAcademicYear(),
                term,
                schoolClass,
                request.getStartDate(),
                request.getEndDate(),
                request.getStatus(),
                request.getDescription()
        );

        Exam saved = examRepository.save(exam);
        return ExamResponseDTO.fromEntity(saved);
    }

    @Override
    public ExamResponseDTO updateExam(Long id, UpdateExamRequest request) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id, "EXAM_NOT_FOUND"));

        SchoolClass targetClass = exam.getSchoolClass();
        if (request.getClassId() != null) {
            targetClass = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId(), "CLASS_NOT_FOUND"));
        }
        Integer targetYear = request.getAcademicYear() != null ? request.getAcademicYear() : exam.getAcademicYear();
        ExamTerm targetTerm = request.getTerm() != null ? request.getTerm() : exam.getTerm();
        ensureTermExamAvailable(targetClass, targetYear, targetTerm, exam);
        if (request.getName() != null || request.getClassId() != null) {
            ensureNameMatchesGrade(request.getName() != null ? request.getName() : exam.getName(),
                    targetClass != null ? targetClass.getGradeLevel() : null);
        }

        if (request.getName() != null) exam.setName(request.getName().trim());
        if (request.getAcademicYear() != null) exam.setAcademicYear(request.getAcademicYear());
        if (request.getTerm() != null) exam.setTerm(request.getTerm());
        if (request.getClassId() != null) {
            exam.setSchoolClass(targetClass);
        }
        if (request.getStartDate() != null) exam.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) exam.setEndDate(request.getEndDate());
        if (request.getStatus() != null) exam.setStatus(request.getStatus());
        if (request.getDescription() != null) exam.setDescription(request.getDescription().trim());

        if (exam.getStartDate() != null && exam.getEndDate() != null && exam.getStartDate().isAfter(exam.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Exam updated = examRepository.save(exam);
        return ExamResponseDTO.fromEntity(updated);
    }

    @Override
    public void deleteExam(Long id) {
        if (!examRepository.existsById(id)) {
            throw new ResourceNotFoundException("EXAM_NOT_FOUND", "Exam not found with id: " + id);
        }
        // Never silently discard students' results: an exam with recorded marks must be cleared first.
        long recordedMarks = markRepository.countMarksByExamId(id);
        if (recordedMarks > 0) {
            throw new IllegalArgumentException("This exam has " + recordedMarks
                    + " recorded marks and cannot be deleted. Remove its marks first.");
        }
        examScheduleRepository.deleteAll(examScheduleRepository.findByExamId(id));
        examRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDTO> getExamsForClass(Long classId, Integer academicYear) {
        List<Exam> exams;
        if (academicYear != null) {
            exams = examRepository.findBySchoolClassIdAndAcademicYearOrderByTermAsc(classId, academicYear);
        } else {
            exams = examRepository.findBySchoolClassIdOrderByStartDateDesc(classId);
        }
        return exams.stream()
                .map(ExamResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public ExamWithTimetableResponseDTO createExamWithTimetable(CreateExamWithTimetableRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Exam start date cannot be after end date");
        }
        if (request.getClassIds() == null || request.getClassIds().isEmpty()) {
            throw new IllegalArgumentException("At least one class must be selected");
        }
        if (request.getSlots() == null || request.getSlots().isEmpty()) {
            throw new IllegalArgumentException("At least one subject exam slot is required");
        }

        // Validate all slot dates and times
        for (ExamSlotItemRequest slot : request.getSlots()) {
            if (slot.getExamDate().isBefore(request.getStartDate()) || slot.getExamDate().isAfter(request.getEndDate())) {
                throw new IllegalArgumentException("Subject exam date (" + slot.getExamDate() + ") must be within the exam date range ["
                        + request.getStartDate() + " to " + request.getEndDate() + "]");
            }
            if (!slot.getStartTime().isBefore(slot.getEndTime())) {
                throw new IllegalArgumentException("Start time must be before end time for subject exam on " + slot.getExamDate());
            }
        }

        if (new HashSet<>(request.getClassIds()).size() != request.getClassIds().size()) {
            throw new IllegalArgumentException("Each class can only be selected once");
        }
        List<SchoolClass> targetClasses = new ArrayList<>();
        for (Long classId : request.getClassIds()) {
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId, "CLASS_NOT_FOUND"));
            if (!Objects.equals(schoolClass.getGradeLevel(), request.getGradeLevel())) {
                throw new IllegalArgumentException("All selected classes must belong to Grade " + request.getGradeLevel());
            }
            targetClasses.add(schoolClass);
        }
        ensureNameMatchesGrade(request.getName(), request.getGradeLevel());
        ensureTermExamAvailable(targetClasses.get(0), request.getAcademicYear(), request.getTerm(), null);

        List<User> allStaff = userRepository.findAll();
        List<ExamResponseDTO> createdExams = new ArrayList<>();
        List<ExamScheduleResponse> createdSchedules = new ArrayList<>();

        for (SchoolClass schoolClass : targetClasses) {

            // Format Exam Name
            String examName = request.getName();
            if (examName == null || examName.isBlank()) {
                examName = "Grade " + schoolClass.getGradeLevel() + " " + request.getTerm().getDisplayName() + " Examination";
                if (request.getClassIds().size() > 1) {
                    examName += " (" + schoolClass.getName() + ")";
                }
            } else if (request.getClassIds().size() > 1 && !examName.contains(schoolClass.getName())) {
                examName = examName + " (" + schoolClass.getName() + ")";
            }

            Exam exam = new Exam(
                    examName,
                    request.getAcademicYear(),
                    request.getTerm(),
                    schoolClass,
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getStatus() != null ? request.getStatus() : ExamStatus.UPCOMING,
                    request.getDescription()
            );
            Exam savedExam = examRepository.save(exam);
            createdExams.add(ExamResponseDTO.fromEntity(savedExam));

            // Default Room for Class (e.g. 10-A -> G-101, 10-B -> G-102)
            String roomCode = CampusFacility.getDefaultRoomForClass(schoolClass.getGradeLevel(), schoolClass.getName());

            for (ExamSlotItemRequest slotReq : request.getSlots()) {
                Subject subject = subjectRepository.findById(slotReq.getSubjectId())
                        .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + slotReq.getSubjectId(), "SUBJECT_NOT_FOUND"));

                User invigilator = resolveInvigilator(slotReq, schoolClass, allStaff, subject);
                User coInvigilator = slotReq.getCoInvigilatorId() != null
                        ? ExamConflictService.requireInvigilator(userRepository, slotReq.getCoInvigilatorId(), "Co-invigilator")
                        : null;

                // Check conflict
                ExamConflictCheckResponse clash = conflictService.checkConflict(
                        schoolClass.getId(),
                        invigilator.getId(),
                        coInvigilator != null ? coInvigilator.getId() : null,
                        slotReq.getExamDate(),
                        slotReq.getStartTime(),
                        slotReq.getEndTime(),
                        roomCode,
                        null
                );
                if (clash.isHasConflict()) {
                    throw new IllegalArgumentException("Scheduling conflict in " + schoolClass.getName() + " (" + subject.getName() + "): " + clash.getMessage());
                }

                ExamSchedule schedule = new ExamSchedule(
                        savedExam,
                        schoolClass,
                        subject,
                        slotReq.getExamDate(),
                        slotReq.getStartTime(),
                        slotReq.getEndTime(),
                        roomCode,
                        invigilator,
                        coInvigilator,
                        slotReq.getMaxMarks() != null ? slotReq.getMaxMarks() : 100,
                        slotReq.getInstructions()
                );
                ExamSchedule savedSchedule = examScheduleRepository.save(schedule);
                createdSchedules.add(conflictService.toResponseDTO(savedSchedule));
            }
        }

        String summary = String.format("Successfully scheduled examination across %d classes with %d subject exam slots in respective classrooms.",
                createdExams.size(), createdSchedules.size());

        return new ExamWithTimetableResponseDTO(createdExams, createdSchedules, summary);
    }

    @Override
    public ExamWithTimetableResponseDTO updateExamWithTimetable(Long id, CreateExamWithTimetableRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Exam start date cannot be after end date");
        }
        if (request.getSlots() == null || request.getSlots().isEmpty()) {
            throw new IllegalArgumentException("At least one subject exam slot is required");
        }

        // Validate all slot dates and times
        for (ExamSlotItemRequest slot : request.getSlots()) {
            if (slot.getExamDate().isBefore(request.getStartDate()) || slot.getExamDate().isAfter(request.getEndDate())) {
                throw new IllegalArgumentException("Subject exam date (" + slot.getExamDate() + ") must be within the exam date range ["
                        + request.getStartDate() + " to " + request.getEndDate() + "]");
            }
            if (!slot.getStartTime().isBefore(slot.getEndTime())) {
                throw new IllegalArgumentException("Start time must be before end time for subject exam on " + slot.getExamDate());
            }
        }

        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id, "EXAM_NOT_FOUND"));

        SchoolClass targetClass = exam.getSchoolClass();
        if (request.getClassIds() != null && !request.getClassIds().isEmpty()) {
            Long primaryClassId = request.getClassIds().get(0);
            targetClass = schoolClassRepository.findById(primaryClassId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + primaryClassId, "CLASS_NOT_FOUND"));
        }
        if (targetClass != null && !Objects.equals(targetClass.getGradeLevel(), request.getGradeLevel())) {
            throw new IllegalArgumentException("Selected class must belong to Grade " + request.getGradeLevel());
        }
        Integer targetYear = request.getAcademicYear() != null ? request.getAcademicYear() : exam.getAcademicYear();
        ExamTerm targetTerm = request.getTerm() != null ? request.getTerm() : exam.getTerm();
        ensureTermExamAvailable(targetClass, targetYear, targetTerm, exam);
        ensureNameMatchesGrade(request.getName(), request.getGradeLevel());

        if (request.getName() != null && !request.getName().isBlank()) {
            exam.setName(request.getName().trim());
        }
        if (request.getAcademicYear() != null) {
            exam.setAcademicYear(request.getAcademicYear());
        }
        if (request.getTerm() != null) {
            exam.setTerm(request.getTerm());
        }
        if (request.getStartDate() != null) {
            exam.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            exam.setEndDate(request.getEndDate());
        }
        if (request.getStatus() != null) {
            exam.setStatus(request.getStatus());
        }
        if (request.getDescription() != null) {
            exam.setDescription(request.getDescription().trim());
        }

        if (request.getClassIds() != null && !request.getClassIds().isEmpty()) {
            exam.setSchoolClass(targetClass);
        }

        Exam savedExam = examRepository.save(exam);

        // Remove existing schedules for this exam before saving the updated ones
        List<ExamSchedule> existingSchedules = examScheduleRepository.findByExamId(savedExam.getId());
        if (!existingSchedules.isEmpty()) {
            examScheduleRepository.deleteAll(existingSchedules);
            examScheduleRepository.flush();
        }

        targetClass = savedExam.getSchoolClass();
        String roomCode = targetClass != null
                ? CampusFacility.getDefaultRoomForClass(targetClass.getGradeLevel(), targetClass.getName())
                : "MAIN-HALL";

        List<User> allStaff = userRepository.findAll();
        List<ExamScheduleResponse> updatedSchedules = new ArrayList<>();

        for (ExamSlotItemRequest slotReq : request.getSlots()) {
            Subject subject = subjectRepository.findById(slotReq.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + slotReq.getSubjectId(), "SUBJECT_NOT_FOUND"));

            User invigilator = resolveInvigilator(slotReq, targetClass, allStaff, subject);
            User coInvigilator = slotReq.getCoInvigilatorId() != null
                    ? ExamConflictService.requireInvigilator(userRepository, slotReq.getCoInvigilatorId(), "Co-invigilator")
                    : null;

            if (targetClass != null) {
                ExamConflictCheckResponse clash = conflictService.checkConflict(
                        targetClass.getId(),
                        invigilator.getId(),
                        coInvigilator != null ? coInvigilator.getId() : null,
                        slotReq.getExamDate(),
                        slotReq.getStartTime(),
                        slotReq.getEndTime(),
                        roomCode,
                        null
                );
                if (clash.isHasConflict()) {
                    throw new IllegalArgumentException("Scheduling conflict in " + targetClass.getName() + " (" + subject.getName() + "): " + clash.getMessage());
                }
            }

            ExamSchedule schedule = new ExamSchedule(
                    savedExam,
                    targetClass,
                    subject,
                    slotReq.getExamDate(),
                    slotReq.getStartTime(),
                    slotReq.getEndTime(),
                    roomCode,
                    invigilator,
                    coInvigilator,
                    slotReq.getMaxMarks() != null ? slotReq.getMaxMarks() : 100,
                    slotReq.getInstructions()
            );
            ExamSchedule savedSchedule = examScheduleRepository.save(schedule);
            updatedSchedules.add(conflictService.toResponseDTO(savedSchedule));
        }

        String summary = String.format("Successfully updated examination timetable with %d subject exam slots.",
                updatedSchedules.size());

        return new ExamWithTimetableResponseDTO(List.of(ExamResponseDTO.fromEntity(savedExam)), updatedSchedules, summary);
    }

    // Picks the first available invigilator: the requested teacher, then the class teacher, then any
    // active teacher. Each candidate must be an active teacher who is free for the whole session.
    private User resolveInvigilator(ExamSlotItemRequest slotReq, SchoolClass schoolClass, List<User> allStaff, Subject subject) {
        ExamConflictService.requireValidTimes(slotReq.getStartTime(), slotReq.getEndTime());
        List<User> candidates = new ArrayList<>();
        if (slotReq.getInvigilatorId() != null) {
            candidates.add(ExamConflictService.requireInvigilator(userRepository, slotReq.getInvigilatorId(), "Invigilator"));
        }
        if (schoolClass != null && schoolClass.getClassTeacher() != null) {
            candidates.add(schoolClass.getClassTeacher());
        }
        candidates.addAll(allStaff);
        return candidates.stream()
                .filter(ExamConflictService::canInvigilate)
                .filter(teacher -> ExamConflictService.isInvigilatorFree(examScheduleRepository, teacher.getId(),
                        slotReq.getExamDate(), slotReq.getStartTime(), slotReq.getEndTime()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No teacher is free to invigilate "
                        + (schoolClass != null ? schoolClass.getName() + " " : "") + "(" + subject.getName() + ") on "
                        + slotReq.getExamDate() + " from " + slotReq.getStartTime() + " to " + slotReq.getEndTime()));
    }

    private static final Pattern GRADE_IN_NAME = Pattern.compile("(?i)\\bgrade\\s*(\\d{1,2})\\b");

    // Rejects names like "Grade 10 Term Examination" for Grade 1 classes, which otherwise surface
    // in the wrong grade's exam lists, report cards and analytics.
    private void ensureNameMatchesGrade(String name, Integer gradeLevel) {
        if (name == null || gradeLevel == null) {
            return;
        }
        Matcher matcher = GRADE_IN_NAME.matcher(name);
        while (matcher.find()) {
            int namedGrade = Integer.parseInt(matcher.group(1));
            if (namedGrade != gradeLevel) {
                throw new IllegalArgumentException("Exam name mentions Grade " + namedGrade
                        + " but the selected class is in Grade " + gradeLevel + ". Fix the exam name or the grade.");
            }
        }
    }

    private void ensureTermExamAvailable(SchoolClass schoolClass, Integer academicYear, ExamTerm term, Exam existingExam) {
        if (schoolClass == null || term == null || term == ExamTerm.OTHER) {
            return;
        }
        Integer gradeLevel = schoolClass.getGradeLevel();
        if (existingExam != null && existingExam.getSchoolClass() != null
                && Objects.equals(existingExam.getSchoolClass().getGradeLevel(), gradeLevel)
                && Objects.equals(existingExam.getAcademicYear(), academicYear)
                && existingExam.getTerm() == term) {
            return;
        }

        // Serialize attempts for the same grade so a second request sees the first committed exam.
        schoolClassRepository.lockByGradeLevel(gradeLevel);
        if (examRepository.existsTermExamForGrade(gradeLevel, academicYear, term)) {
            throw new IllegalArgumentException("Grade " + gradeLevel + " already has " + term.getDisplayName()
                    + " scheduled for academic year " + academicYear + ". Choose another term or year.");
        }
    }
}
