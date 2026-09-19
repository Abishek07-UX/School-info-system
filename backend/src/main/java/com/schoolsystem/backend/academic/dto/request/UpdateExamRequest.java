package com.schoolsystem.backend.academic.dto.request;

import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import java.time.LocalDate;

public class UpdateExamRequest {

    private String name;
    private Integer academicYear;
    private ExamTerm term;
    private Long classId;
    private LocalDate startDate;
    private LocalDate endDate;
    private ExamStatus status;
    private String description;

    public UpdateExamRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public ExamTerm getTerm() {
        return term;
    }

    public void setTerm(ExamTerm term) {
        this.term = term;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public ExamStatus getStatus() {
        return status;
    }

    public void setStatus(ExamStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
