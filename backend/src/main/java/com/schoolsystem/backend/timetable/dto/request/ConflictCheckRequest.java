package com.schoolsystem.backend.timetable.dto.request;

import com.schoolsystem.backend.timetable.model.DayOfWeek;
import jakarta.validation.constraints.NotNull;

public class ConflictCheckRequest {

    @NotNull(message = "Class ID is required")
    private Long classId;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Period number is required")
    private Integer periodNumber;

    @NotNull(message = "Academic year is required")
    private Integer academicYear;

    private Long excludeSlotId;

    public ConflictCheckRequest() {
    }

    public ConflictCheckRequest(Long classId, Long teacherId, DayOfWeek dayOfWeek,
                                Integer periodNumber, Integer academicYear, Long excludeSlotId) {
        this.classId = classId;
        this.teacherId = teacherId;
        this.dayOfWeek = dayOfWeek;
        this.periodNumber = periodNumber;
        this.academicYear = academicYear;
        this.excludeSlotId = excludeSlotId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public Integer getPeriodNumber() {
        return periodNumber;
    }

    public void setPeriodNumber(Integer periodNumber) {
        this.periodNumber = periodNumber;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public Long getExcludeSlotId() {
        return excludeSlotId;
    }

    public void setExcludeSlotId(Long excludeSlotId) {
        this.excludeSlotId = excludeSlotId;
    }
}
