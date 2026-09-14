package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.request.CreateExamRequest;
import com.schoolsystem.backend.academic.dto.request.UpdateExamRequest;
import com.schoolsystem.backend.academic.dto.response.ExamResponseDTO;
import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import com.schoolsystem.backend.academic.repository.ExamRepository;
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
import com.schoolsystem.backend.user.model.UserRole;
import com.schoolsystem.backend.user.repository.UserRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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

    public ExamServiceImpl(ExamRepository examRepository,
                           SchoolClassRepository schoolClassRepository,
                           ExamScheduleRepository examScheduleRepository,
                           SubjectRepository subjectRepository,
                           UserRepository userRepository,
                           ExamConflictService conflictService) {
        this.examRepository = examRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.examScheduleRepository = examScheduleRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.conflictService = conflictService;
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

        if (request.getName() != null) exam.setName(request.getName().trim());
        if (request.getAcademicYear() != null) exam.setAcademicYear(request.getAcademicYear());
        if (request.getTerm() != null) exam.setTerm(request.getTerm());
        if (request.getClassId() != null) {
            SchoolClass sc = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId(), "CLASS_NOT_FOUND"));
            exam.setSchoolClass(sc);
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
            throw new ResourceNotFoundException("Exam not found with id: " + id, "EXAM_NOT_FOUND");
        }
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

        List<User> allStaff = userRepository.findAll();
        List<ExamResponseDTO> createdExams = new ArrayList<>();
        List<ExamScheduleResponse> createdSchedules = new ArrayList<>();

        for (Long classId : request.getClassIds()) {
            SchoolClass schoolClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId, "CLASS_NOT_FOUND"));

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

                // Resolve Invigilator: slot-specified -> class teacher -> any active teacher
                User invigilator = null;
                if (slotReq.getInvigilatorId() != null) {
                    invigilator = userRepository.findById(slotReq.getInvigilatorId()).orElse(null);
                }
                if (invigilator == null && schoolClass.getClassTeacher() != null) {
                    invigilator = schoolClass.getClassTeacher();
                }
                if (invigilator == null) {
                    invigilator = allStaff.stream()
                            .filter(u -> u.getRole() == UserRole.TEACHER || u.getRole() == UserRole.ADMIN || u.getRole() == UserRole.PRINCIPAL)
                            .findFirst()
                            .orElse(allStaff.isEmpty() ? null : allStaff.get(0));
                }
                if (invigilator == null) {
                    throw new IllegalStateException("No staff found in system to assign as invigilator");
                }

                User coInvigilator = slotReq.getCoInvigilatorId() != null
                        ? userRepository.findById(slotReq.getCoInvigilatorId()).orElse(null)
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
}
