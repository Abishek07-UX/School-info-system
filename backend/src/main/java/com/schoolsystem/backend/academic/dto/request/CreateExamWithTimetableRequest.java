package com.schoolsystem.backend.academic.dto.request;

import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class CreateExamWithTimetableRequest {

    private String name;

    @NotNull(message = "Academic year is required")
    private Integer academicYear;

    @NotNull(message = "Term is required (TERM_1, TERM_2, TERM_3)")
    private ExamTerm term;

    @NotNull(message = "Grade level is required")
    private Integer gradeLevel;

    @NotEmpty(message = "At least one target class must be selected")
    private List<Long> classIds;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private ExamStatus status = ExamStatus.UPCOMING;

    private String description;

    @NotEmpty(message = "At least one subject exam slot is required")
    @Valid
    private List<ExamSlotItemRequest> slots;

    public CreateExamWithTimetableRequest() {
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

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public List<Long> getClassIds() {
        return classIds;
    }

    public void setClassIds(List<Long> classIds) {
        this.classIds = classIds;
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

    public List<ExamSlotItemRequest> getSlots() {
        return slots;
    }

    public void setSlots(List<ExamSlotItemRequest> slots) {
        this.slots = slots;
    }
}
