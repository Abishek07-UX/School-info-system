package com.schoolsystem.backend.academic.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class MarkItemDTO {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Score is required")
    @DecimalMin(value = "0.0", message = "Score cannot be less than 0")
    @DecimalMax(value = "100.0", message = "Score cannot be greater than 100")
    private Double score;

    private String remarks;

    public MarkItemDTO() {
    }

    public MarkItemDTO(Long studentId, Double score, String remarks) {
        this.studentId = studentId;
        this.score = score;
        this.remarks = remarks;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
