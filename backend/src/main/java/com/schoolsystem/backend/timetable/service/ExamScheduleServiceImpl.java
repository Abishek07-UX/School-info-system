package com.schoolsystem.backend.timetable.service;

import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.repository.ExamRepository;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.timetable.dto.request.ExamScheduleRequest;
import com.schoolsystem.backend.timetable.dto.response.ExamConflictCheckResponse;
import com.schoolsystem.backend.timetable.dto.response.ExamScheduleResponse;
import com.schoolsystem.backend.timetable.model.ExamSchedule;
import com.schoolsystem.backend.timetable.repository.ExamScheduleRepository;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExamScheduleServiceImpl implements ExamScheduleService {

    private final ExamScheduleRepository examScheduleRepository;
    private final ExamRepository examRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ExamConflictService conflictService;

    public ExamScheduleServiceImpl(ExamScheduleRepository examScheduleRepository,
                                  ExamRepository examRepository,
                                  SchoolClassRepository schoolClassRepository,
                                  SubjectRepository subjectRepository,
                                  UserRepository userRepository,
                                  ExamConflictService conflictService) {
        this.examScheduleRepository = examScheduleRepository;
        this.examRepository = examRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.conflictService = conflictService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamScheduleResponse> getSchedulesForExam(Long examId) {
        return examScheduleRepository.findByExamIdWithDetails(examId).stream()
                .map(conflictService::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamScheduleResponse> getSchedulesForClass(Long classId, Long examId) {
        return examScheduleRepository.findByClassAndExamWithDetails(classId, examId).stream()
                .map(conflictService::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamScheduleResponse> getInvigilatorDuties(Long teacherId) {
        return examScheduleRepository.findTeacherInvigilationDutiesWithDetails(teacherId).stream()
                .map(conflictService::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ExamScheduleResponse createExamSchedule(ExamScheduleRequest req) {
        // Enforce conflict check
        ExamConflictCheckResponse clash = conflictService.checkConflict(
                req.getClassId(),
                req.getInvigilatorId(),
                req.getCoInvigilatorId(),
                req.getExamDate(),
                req.getStartTime(),
                req.getEndTime(),
                req.getRoom(),
                null
        );

        if (clash.isHasConflict()) {
            throw new IllegalArgumentException(clash.getMessage());
        }

        Exam exam = examRepository.findById(req.getExamId())
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + req.getExamId()));
        SchoolClass sc = schoolClassRepository.findById(req.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + req.getClassId()));
        Subject sub = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + req.getSubjectId()));
        User invigilator = userRepository.findById(req.getInvigilatorId())
                .orElseThrow(() -> new IllegalArgumentException("Invigilator not found: " + req.getInvigilatorId()));
        User coInvigilator = req.getCoInvigilatorId() != null
                ? userRepository.findById(req.getCoInvigilatorId()).orElse(null)
                : null;

        ExamSchedule schedule = new ExamSchedule(
                exam, sc, sub, req.getExamDate(), req.getStartTime(), req.getEndTime(),
                req.getRoom(), invigilator, coInvigilator, req.getMaxMarks(), req.getInstructions()
        );

        ExamSchedule saved = examScheduleRepository.save(schedule);
        return conflictService.toResponseDTO(saved);
    }

    @Override
    public ExamScheduleResponse updateExamSchedule(Long scheduleId, ExamScheduleRequest req) {
        ExamSchedule schedule = examScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Exam schedule not found with ID: " + scheduleId));

        ExamConflictCheckResponse clash = conflictService.checkConflict(
                req.getClassId(),
                req.getInvigilatorId(),
                req.getCoInvigilatorId(),
                req.getExamDate(),
                req.getStartTime(),
                req.getEndTime(),
                req.getRoom(),
                scheduleId
        );

        if (clash.isHasConflict()) {
            throw new IllegalArgumentException(clash.getMessage());
        }

        Exam exam = examRepository.findById(req.getExamId())
                .orElseThrow(() -> new IllegalArgumentException("Exam not found: " + req.getExamId()));
        SchoolClass sc = schoolClassRepository.findById(req.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found: " + req.getClassId()));
        Subject sub = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Subject not found: " + req.getSubjectId()));
        User invigilator = userRepository.findById(req.getInvigilatorId())
                .orElseThrow(() -> new IllegalArgumentException("Invigilator not found: " + req.getInvigilatorId()));
        User coInvigilator = req.getCoInvigilatorId() != null
                ? userRepository.findById(req.getCoInvigilatorId()).orElse(null)
                : null;

        schedule.setExam(exam);
        schedule.setSchoolClass(sc);
        schedule.setSubject(sub);
        schedule.setExamDate(req.getExamDate());
        schedule.setStartTime(req.getStartTime());
        schedule.setEndTime(req.getEndTime());
        schedule.setRoom(req.getRoom());
        schedule.setInvigilator(invigilator);
        schedule.setCoInvigilator(coInvigilator);
        schedule.setMaxMarks(req.getMaxMarks());
        schedule.setInstructions(req.getInstructions());

        ExamSchedule saved = examScheduleRepository.save(schedule);
        return conflictService.toResponseDTO(saved);
    }

    @Override
    public void deleteExamSchedule(Long scheduleId) {
        examScheduleRepository.deleteById(scheduleId);
    }
}
