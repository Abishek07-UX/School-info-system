package com.schoolsystem.backend.timetable.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.timetable.dto.request.ConflictCheckRequest;
import com.schoolsystem.backend.timetable.dto.response.ConflictCheckResponse;
import com.schoolsystem.backend.timetable.dto.response.TimetableSlotResponse;
import com.schoolsystem.backend.timetable.model.CampusFacility;
import com.schoolsystem.backend.timetable.model.DayOfWeek;
import com.schoolsystem.backend.timetable.model.PeriodSlot;
import com.schoolsystem.backend.timetable.model.TimetableSlot;
import com.schoolsystem.backend.timetable.repository.TimetableRepository;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class TimetableConflictService {

    private final TimetableRepository timetableRepository;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;

    public TimetableConflictService(TimetableRepository timetableRepository,
                                  UserRepository userRepository,
                                  SchoolClassRepository schoolClassRepository) {
        this.timetableRepository = timetableRepository;
        this.userRepository = userRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    /**
     * Checks if a proposed slot produces any teacher or class collisions.
     */
    public ConflictCheckResponse checkConflict(ConflictCheckRequest request) {
        return checkConflict(
                request.getClassId(),
                request.getTeacherId(),
                request.getDayOfWeek(),
                request.getPeriodNumber(),
                request.getAcademicYear(),
                request.getExcludeSlotId()
        );
    }

    public ConflictCheckResponse checkConflict(Long classId, Long teacherId, DayOfWeek dayOfWeek,
                                               Integer periodNumber, Integer academicYear, Long excludeSlotId) {

        // 1. Check Teacher Conflict: Is this teacher already teaching another class at this (day, period)?
        Optional<TimetableSlot> teacherSlotOpt = timetableRepository
                .findByTeacherIdAndDayOfWeekAndPeriodNumberAndAcademicYear(teacherId, dayOfWeek, periodNumber, academicYear);

        if (teacherSlotOpt.isPresent()) {
            TimetableSlot conflicting = teacherSlotOpt.get();
            if (excludeSlotId == null || !conflicting.getId().equals(excludeSlotId)) {
                User teacher = userRepository.findById(teacherId).orElse(conflicting.getTeacher());
                return ConflictCheckResponse.teacherClash(toResponseDTO(conflicting), teacher.getFullName());
            }
        }

        // 2. Check Class Conflict: Does this class already have a subject assigned at this (day, period)?
        Optional<TimetableSlot> classSlotOpt = timetableRepository
                .findBySchoolClassIdAndDayOfWeekAndPeriodNumberAndAcademicYear(classId, dayOfWeek, periodNumber, academicYear);

        if (classSlotOpt.isPresent()) {
            TimetableSlot conflicting = classSlotOpt.get();
            if (excludeSlotId == null || !conflicting.getId().equals(excludeSlotId)) {
                SchoolClass sc = schoolClassRepository.findById(classId).orElse(conflicting.getSchoolClass());
                return ConflictCheckResponse.classClash(toResponseDTO(conflicting), sc.getName());
            }
        }

        return ConflictCheckResponse.noConflict();
    }

    public TimetableSlotResponse toResponseDTO(TimetableSlot slot) {
        TimetableSlotResponse dto = new TimetableSlotResponse();
        dto.setId(slot.getId());

        if (slot.getSchoolClass() != null) {
            dto.setClassId(slot.getSchoolClass().getId());
            dto.setClassName(slot.getSchoolClass().getName());
            dto.setGradeLevel(slot.getSchoolClass().getGradeLevel());
            dto.setBuilding(CampusFacility.getBuildingForGrade(slot.getSchoolClass().getGradeLevel()));
            dto.setRoomCode(CampusFacility.getDefaultRoomForClass(
                    slot.getSchoolClass().getGradeLevel(),
                    slot.getSchoolClass().getName()
            ));
        }

        if (slot.getSubject() != null) {
            dto.setSubjectId(slot.getSubject().getId());
            dto.setSubjectName(slot.getSubject().getName());
            dto.setSubjectCode(slot.getSubject().getCode());
        }

        if (slot.getTeacher() != null) {
            dto.setTeacherId(slot.getTeacher().getId());
            dto.setTeacherName(slot.getTeacher().getFullName());
            dto.setTeacherEmail(slot.getTeacher().getEmail());
        }

        dto.setDayOfWeek(slot.getDayOfWeek());
        dto.setDayDisplayName(slot.getDayOfWeek().getDisplayName());
        dto.setPeriodNumber(slot.getPeriodNumber());

        PeriodSlot pSlot = PeriodSlot.fromNumber(slot.getPeriodNumber());
        dto.setPeriodLabel(pSlot.getLabel());
        dto.setStartTime(slot.getStartTime() != null ? slot.getStartTime() : pSlot.getStartTime());
        dto.setEndTime(slot.getEndTime() != null ? slot.getEndTime() : pSlot.getEndTime());
        dto.setAcademicYear(slot.getAcademicYear());

        return dto;
    }
}
