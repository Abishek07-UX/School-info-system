package com.schoolsystem.backend.timetable.dto.request;

import com.schoolsystem.backend.timetable.model.DayOfWeek;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TimetableSlotRequest {

    @NotNull(message = "Class ID is required")
    private Long classId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Period number is required")
    @Min(value = 1, message = "Period number must be between 1 and 8")
    @Max(value = 8, message = "Period number must be between 1 and 8")
    private Integer periodNumber;

    @NotNull(message = "Academic year is required")
    private Integer academicYear;

    public TimetableSlotRequest() {
    }

    public TimetableSlotRequest(Long classId, Long subjectId, Long teacherId,
                                DayOfWeek dayOfWeek, Integer periodNumber, Integer academicYear) {
        this.classId = classId;
        this.subjectId = subjectId;
        this.teacherId = teacherId;
        this.dayOfWeek = dayOfWeek;
        this.periodNumber = periodNumber;
        this.academicYear = academicYear;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
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
}
