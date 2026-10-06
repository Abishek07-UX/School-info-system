package com.schoolsystem.backend.finance.dto.response;

import com.schoolsystem.backend.finance.model.FeeStructure;
import java.time.LocalDate;

public class FeeStructureDTO {

    private Long id;
    private Long classId;
    private String className;
    private String term;
    private Integer academicYear;
    private String feeType;
    private Double amount;
    private LocalDate dueDate;

    public FeeStructureDTO() {
    }

    public FeeStructureDTO(FeeStructure fs) {
        if (fs == null) return;
        this.id = fs.getId();
        if (fs.getSchoolClass() != null) {
            this.classId = fs.getSchoolClass().getId();
            this.className = fs.getSchoolClass().getName();
        }
        this.term = fs.getTerm();
        this.academicYear = fs.getAcademicYear();
        this.feeType = fs.getFeeType();
        this.amount = fs.getAmount();
        this.dueDate = fs.getDueDate();
    }

    public Long getId() {
        return id;
    }

    public Long getClassId() {
        return classId;
    }

    public String getClassName() {
        return className;
    }

    public String getTerm() {
        return term;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public String getFeeType() {
        return feeType;
    }

    public Double getAmount() {
        return amount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }
}
