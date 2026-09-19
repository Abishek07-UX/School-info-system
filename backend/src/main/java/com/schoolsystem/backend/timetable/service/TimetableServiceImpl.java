package com.schoolsystem.backend.timetable.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.timetable.dto.request.TimetableSlotRequest;
import com.schoolsystem.backend.timetable.dto.response.*;
import com.schoolsystem.backend.timetable.model.CampusFacility;
import com.schoolsystem.backend.timetable.model.DayOfWeek;
import com.schoolsystem.backend.timetable.model.PeriodSlot;
import com.schoolsystem.backend.timetable.model.TimetableSlot;
import com.schoolsystem.backend.timetable.repository.TimetableRepository;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class TimetableServiceImpl implements TimetableService {

    private final TimetableRepository timetableRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final TimetableConflictService conflictService;
    private final TimetableAutoGeneratorService autoGeneratorService;

    public TimetableServiceImpl(TimetableRepository timetableRepository,
                                SchoolClassRepository schoolClassRepository,
                                SubjectRepository subjectRepository,
                                UserRepository userRepository,
                                TimetableConflictService conflictService,
                                TimetableAutoGeneratorService autoGeneratorService) {
        this.timetableRepository = timetableRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.conflictService = conflictService;
        this.autoGeneratorService = autoGeneratorService;
    }

    @Override
    @Transactional(readOnly = true)
    public ClassTimetableResponse getClassTimetable(Long classId, Integer academicYear) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found with ID: " + classId));

        List<TimetableSlot> slots = timetableRepository.findClassTimetableWithDetails(classId, academicYear);

        ClassTimetableResponse response = new ClassTimetableResponse();
        response.setClassId(schoolClass.getId());
        response.setClassName(schoolClass.getName());
        response.setGradeLevel(schoolClass.getGradeLevel());
        response.setBuilding(CampusFacility.getBuildingForGrade(schoolClass.getGradeLevel()));
        response.setRoomCode(CampusFacility.getDefaultRoomForClass(schoolClass.getGradeLevel(), schoolClass.getName()));
        response.setClassTeacherName(schoolClass.getClassTeacher() != null ? schoolClass.getClassTeacher().getFullName() : "Not Assigned");
        response.setAcademicYear(academicYear);

        Map<String, Map<Integer, TimetableSlotResponse>> grid = new LinkedHashMap<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            grid.put(day.name(), new LinkedHashMap<>());
        }

        List<TimetableSlotResponse> dtoList = new ArrayList<>();
        for (TimetableSlot slot : slots) {
            TimetableSlotResponse dto = conflictService.toResponseDTO(slot);
            dtoList.add(dto);
            grid.get(slot.getDayOfWeek().name()).put(slot.getPeriodNumber(), dto);
        }

        response.setWeeklyGrid(grid);
        response.setSlots(dtoList);
        response.setAssignedSlotsCount(slots.size());
        response.setUnassignedSlotsCount(Math.max(0, 40 - slots.size()));

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherScheduleResponse getTeacherSchedule(Long teacherId, Integer academicYear) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found with ID: " + teacherId));

        List<TimetableSlot> slots = timetableRepository.findTeacherScheduleWithDetails(teacherId, academicYear);

        TeacherScheduleResponse response = new TeacherScheduleResponse();
        response.setTeacherId(teacher.getId());
        response.setTeacherName(teacher.getFullName());
        response.setTeacherEmail(teacher.getEmail());
        response.setPhoneNumber(teacher.getPhoneNumber());
        response.setAcademicYear(academicYear);

        Map<String, Map<Integer, TimetableSlotResponse>> grid = new LinkedHashMap<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            grid.put(day.name(), new LinkedHashMap<>());
        }

        List<TimetableSlotResponse> dtoList = new ArrayList<>();
        for (TimetableSlot slot : slots) {
            TimetableSlotResponse dto = conflictService.toResponseDTO(slot);
            dtoList.add(dto);
            grid.get(slot.getDayOfWeek().name()).put(slot.getPeriodNumber(), dto);
        }

        response.setWeeklyGrid(grid);
        response.setAssignedSlots(dtoList);
        response.setTotalTeachingPeriods(slots.size());
        response.setFreePeriodsCount(Math.max(0, 40 - slots.size()));
        response.setWeeklyWorkloadPercentage(Math.round(((double) slots.size() / 40.0) * 1000.0) / 10.0);

        return response;
    }

    @Override
    public TimetableSlotResponse createSlot(TimetableSlotRequest request) {
        // Enforce conflict check
        ConflictCheckResponse clash = conflictService.checkConflict(
                request.getClassId(),
                request.getTeacherId(),
                request.getDayOfWeek(),
                request.getPeriodNumber(),
                request.getAcademicYear(),
                null
        );

        if (clash.isHasConflict()) {
            throw new IllegalArgumentException(clash.getMessage());
        }

        SchoolClass sc = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + request.getClassId()));
        Subject sub = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + request.getSubjectId()));
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + request.getTeacherId()));

        PeriodSlot pSlot = PeriodSlot.fromNumber(request.getPeriodNumber());

        TimetableSlot slot = new TimetableSlot(
                sc, sub, teacher, request.getDayOfWeek(), request.getPeriodNumber(), request.getAcademicYear()
        );
        slot.setStartTime(pSlot.getStartTime());
        slot.setEndTime(pSlot.getEndTime());

        TimetableSlot saved = timetableRepository.save(slot);
        return conflictService.toResponseDTO(saved);
    }

    @Override
    public TimetableSlotResponse updateSlot(Long slotId, TimetableSlotRequest request) {
        TimetableSlot slot = timetableRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Timetable slot not found with ID: " + slotId));

        // Conflict check excluding current slot
        ConflictCheckResponse clash = conflictService.checkConflict(
                request.getClassId(),
                request.getTeacherId(),
                request.getDayOfWeek(),
                request.getPeriodNumber(),
                request.getAcademicYear(),
                slotId
        );

        if (clash.isHasConflict()) {
            throw new IllegalArgumentException(clash.getMessage());
        }

        SchoolClass sc = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + request.getClassId()));
        Subject sub = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + request.getSubjectId()));
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found: " + request.getTeacherId()));

        PeriodSlot pSlot = PeriodSlot.fromNumber(request.getPeriodNumber());

        slot.setSchoolClass(sc);
        slot.setSubject(sub);
        slot.setTeacher(teacher);
        slot.setDayOfWeek(request.getDayOfWeek());
        slot.setPeriodNumber(request.getPeriodNumber());
        slot.setStartTime(pSlot.getStartTime());
        slot.setEndTime(pSlot.getEndTime());
        slot.setAcademicYear(request.getAcademicYear());

        TimetableSlot saved = timetableRepository.save(slot);
        return conflictService.toResponseDTO(saved);
    }

    @Override
    public void deleteSlot(Long slotId) {
        timetableRepository.deleteById(slotId);
    }

    @Override
    public void clearClassTimetable(Long classId, Integer academicYear) {
        timetableRepository.deleteBySchoolClassIdAndAcademicYear(classId, academicYear);
    }

    @Override
    public List<TimetableSlotResponse> autoGenerateTimetable(Long classId, Integer academicYear) {
        List<TimetableSlot> generated = autoGeneratorService.generateTimetableForClass(classId, academicYear);
        return generated.stream()
                .map(conflictService::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TimetableAuditResponse auditSchoolTimetable(Integer academicYear) {
        List<SchoolClass> allDailyClasses = schoolClassRepository.findAll();
        List<TimetableSlot> allSlots = timetableRepository.findByAcademicYear(academicYear);

        TimetableAuditResponse audit = new TimetableAuditResponse();
        audit.setTotalClasses(allDailyClasses.size());
        audit.setTotalAssignedSlots(allSlots.size());

        Set<Long> scheduledTeacherIds = allSlots.stream()
                .map(s -> s.getTeacher().getId())
                .collect(Collectors.toSet());
        audit.setTotalTeachersScheduled(scheduledTeacherIds.size());

        List<ConflictCheckResponse> clashes = new ArrayList<>();
        Map<String, TimetableSlot> teacherPeriodMap = new HashMap<>();

        for (TimetableSlot s : allSlots) {
            String teacherKey = s.getTeacher().getId() + "-" + s.getDayOfWeek().name() + "-" + s.getPeriodNumber();
            if (teacherPeriodMap.containsKey(teacherKey)) {
                TimetableSlot prev = teacherPeriodMap.get(teacherKey);
                clashes.add(ConflictCheckResponse.teacherClash(conflictService.toResponseDTO(prev), s.getTeacher().getFullName()));
            } else {
                teacherPeriodMap.put(teacherKey, s);
            }
        }

        audit.setConflicts(clashes);
        audit.setTotalConflictsFound(clashes.size());
        audit.setConflictFree(clashes.isEmpty());

        List<String> unassigned = new ArrayList<>();
        Map<Long, List<TimetableSlot>> classSlotsMap = allSlots.stream()
                .collect(Collectors.groupingBy(s -> s.getSchoolClass().getId()));

        for (SchoolClass sc : allDailyClasses) {
            int count = classSlotsMap.getOrDefault(sc.getId(), Collections.emptyList()).size();
            if (count < 40) {
                unassigned.add(String.format("%s: %d/40 periods scheduled (%d unassigned)", sc.getName(), count, 40 - count));
            }
        }
        audit.setUnassignedClassSummaries(unassigned);

        return audit;
    }
}
