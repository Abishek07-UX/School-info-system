package com.schoolsystem.backend.timetable.dto.request;

import jakarta.validation.constraints.NotNull;

public class AutoGenerateRequest {

    private Long classId;

    private Integer gradeLevel;

    @NotNull(message = "Academic year is required")
    private Integer academicYear;

    public AutoGenerateRequest() {
    }

    public AutoGenerateRequest(Long classId, Integer gradeLevel, Integer academicYear) {
        this.classId = classId;
        this.gradeLevel = gradeLevel;
        this.academicYear = academicYear;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }
}
