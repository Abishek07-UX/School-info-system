package com.schoolsystem.backend.finance.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class FeeStructureRequest {

    @NotNull(message = "Class ID is mandatory")
    private Long classId;

    @NotNull(message = "Term is mandatory (e.g. Term 1, Term 2, Term 3)")
    private String term;

    @NotNull(message = "Academic year is mandatory")
    private Integer academicYear;

    @NotNull(message = "Fee type is mandatory")
    private String feeType;

    @NotNull(message = "Amount is mandatory")
    private Double amount;

    private LocalDate dueDate;

    public FeeStructureRequest() {
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}
