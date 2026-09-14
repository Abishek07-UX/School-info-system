package com.schoolsystem.backend.timetable.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.teacher.repository.TeacherSubjectRepository;
import com.schoolsystem.backend.timetable.dto.request.ExamConflictCheckRequest;
import com.schoolsystem.backend.timetable.dto.response.ExamConflictCheckResponse;
import com.schoolsystem.backend.timetable.dto.response.ExamScheduleResponse;
import com.schoolsystem.backend.timetable.model.CampusFacility;
import com.schoolsystem.backend.timetable.model.ExamSchedule;
import com.schoolsystem.backend.timetable.repository.ExamScheduleRepository;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ExamConflictService {

    private final ExamScheduleRepository examScheduleRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;

    public ExamConflictService(ExamScheduleRepository examScheduleRepository,
                               UserRepository userRepository,
                               SchoolClassRepository schoolClassRepository,
                               TeacherSubjectRepository teacherSubjectRepository) {
        this.examScheduleRepository = examScheduleRepository;
        this.userRepository = userRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.teacherSubjectRepository = teacherSubjectRepository;
    }

    public ExamConflictCheckResponse checkConflict(ExamConflictCheckRequest req) {
        return checkConflict(
                req.getClassId(),
                req.getInvigilatorId(),
                req.getCoInvigilatorId(),
                req.getExamDate(),
                req.getStartTime(),
                req.getEndTime(),
                req.getRoom(),
                req.getExcludeScheduleId()
        );
    }

    public ExamConflictCheckResponse checkConflict(Long classId, Long invigilatorId, Long coInvigilatorId,
                                                   LocalDate examDate, LocalTime startTime, LocalTime endTime,
                                                   String room, Long excludeScheduleId) {

        List<ExamSchedule> daySchedules = examScheduleRepository.findByExamDate(examDate);

        for (ExamSchedule other : daySchedules) {
            if (excludeScheduleId != null && other.getId().equals(excludeScheduleId)) {
                continue;
            }

            // Check for time overlap
            boolean overlaps = isTimeOverlapping(startTime, endTime, other.getStartTime(), other.getEndTime());
            if (!overlaps) {
                continue;
            }

            // 1. Class Exam Overlap
            if (classId != null && other.getSchoolClass() != null && other.getSchoolClass().getId().equals(classId)) {
                SchoolClass sc = schoolClassRepository.findById(classId).orElse(other.getSchoolClass());
                return ExamConflictCheckResponse.classExamClash(toResponseDTO(other), sc.getName());
            }

            // 2. Invigilator Duty Clash
            if (other.getInvigilator().getId().equals(invigilatorId) ||
                (other.getCoInvigilator() != null && other.getCoInvigilator().getId().equals(invigilatorId))) {
                User teacher = userRepository.findById(invigilatorId).orElse(other.getInvigilator());
                return ExamConflictCheckResponse.invigilatorClash(toResponseDTO(other), teacher.getFullName());
            }

            // 3. Co-Invigilator Duty Clash
            if (coInvigilatorId != null) {
                if (other.getInvigilator().getId().equals(coInvigilatorId) ||
                    (other.getCoInvigilator() != null && other.getCoInvigilator().getId().equals(coInvigilatorId))) {
                    User teacher = userRepository.findById(coInvigilatorId).orElse(other.getInvigilator());
                    return ExamConflictCheckResponse.invigilatorClash(toResponseDTO(other), teacher.getFullName());
                }
            }

            // 4. Venue Conflict (if a specific hall like Main Auditorium or Lab is specified)
            if (room != null && !room.isBlank() && other.getRoom() != null &&
                room.equalsIgnoreCase(other.getRoom()) && !room.toLowerCase().contains("classroom")) {
                return ExamConflictCheckResponse.venueClash(toResponseDTO(other), room);
            }
        }

        ExamConflictCheckResponse response = ExamConflictCheckResponse.noConflict();

        return response;
    }

    public boolean isSubjectTeacher(Long teacherId, Long classId, Long subjectId) {
        return teacherSubjectRepository.findByTeacherIdAndSubjectIdAndSchoolClassId(teacherId, subjectId, classId).isPresent();
    }

    private boolean isTimeOverlapping(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    public ExamScheduleResponse toResponseDTO(ExamSchedule schedule) {
        ExamScheduleResponse dto = new ExamScheduleResponse();
        dto.setId(schedule.getId());

        if (schedule.getExam() != null) {
            dto.setExamId(schedule.getExam().getId());
            dto.setExamName(schedule.getExam().getName());
            dto.setAcademicYear(schedule.getExam().getAcademicYear());
            dto.setTerm(schedule.getExam().getTerm() != null ? schedule.getExam().getTerm().name() : "");
        }

        if (schedule.getSchoolClass() != null) {
            dto.setClassId(schedule.getSchoolClass().getId());
            dto.setClassName(schedule.getSchoolClass().getName());
            dto.setGradeLevel(schedule.getSchoolClass().getGradeLevel());
            dto.setBuilding(CampusFacility.getBuildingForGrade(schedule.getSchoolClass().getGradeLevel()));
            dto.setDefaultRoom(CampusFacility.getDefaultRoomForClass(
                    schedule.getSchoolClass().getGradeLevel(),
                    schedule.getSchoolClass().getName()
            ));
        } else {
            dto.setClassId(null);
            dto.setClassName("School-wide");
            dto.setGradeLevel(null);
            dto.setBuilding("Campus");
            dto.setDefaultRoom(schedule.getRoom() != null ? schedule.getRoom() : "General Hall");
        }

        if (schedule.getSubject() != null) {
            dto.setSubjectId(schedule.getSubject().getId());
            dto.setSubjectName(schedule.getSubject().getName());
            dto.setSubjectCode(schedule.getSubject().getCode());
            dto.setCustomSubjectName(schedule.getCustomSubjectName());
        } else if (schedule.getCustomSubjectName() != null && !schedule.getCustomSubjectName().isBlank()) {
            dto.setSubjectId(null);
            dto.setSubjectName(schedule.getCustomSubjectName());
            dto.setSubjectCode("OTHER");
            dto.setCustomSubjectName(schedule.getCustomSubjectName());
        } else {
            dto.setSubjectName("General Assessment");
            dto.setSubjectCode("GEN");
        }

        dto.setExamDate(schedule.getExamDate());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setRoom(schedule.getRoom());

        if (schedule.getInvigilator() != null) {
            dto.setInvigilatorId(schedule.getInvigilator().getId());
            dto.setInvigilatorName(schedule.getInvigilator().getFullName());
            dto.setInvigilatorEmail(schedule.getInvigilator().getEmail());
        }

        if (schedule.getCoInvigilator() != null) {
            dto.setCoInvigilatorId(schedule.getCoInvigilator().getId());
            dto.setCoInvigilatorName(schedule.getCoInvigilator().getFullName());
        }

        dto.setMaxMarks(schedule.getMaxMarks());
        dto.setInstructions(schedule.getInstructions());

        return dto;
    }
}
