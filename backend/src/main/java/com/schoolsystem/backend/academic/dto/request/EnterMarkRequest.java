package com.schoolsystem.backend.academic.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class EnterMarkRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Score is required")
    @DecimalMin(value = "0.0", message = "Score cannot be less than 0")
    @DecimalMax(value = "100.0", message = "Score cannot be greater than 100")
    private Double score;

    private String remarks;

    public EnterMarkRequest() {
    }

    public EnterMarkRequest(Long examId, Long studentId, Long subjectId, Double score, String remarks) {
        this.examId = examId;
        this.studentId = studentId;
        this.subjectId = subjectId;
        this.score = score;
        this.remarks = remarks;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
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
