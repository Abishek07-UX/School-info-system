package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.academic.model.Grade;
import com.schoolsystem.backend.academic.model.Mark;
import java.time.LocalDateTime;

public class MarkResponseDTO {

    private Long id;
    private Long examId;
    private String examName;
    private Long studentId;
    private String studentName;
    private String admissionNumber;
    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Double score;
    private Grade grade;
    private String gradeDescription;
    private String remarks;
    private Long recordedById;
    private String recordedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MarkResponseDTO() {
    }

    public static MarkResponseDTO fromEntity(Mark mark) {
        if (mark == null) return null;
        MarkResponseDTO dto = new MarkResponseDTO();
        dto.setId(mark.getId());
        if (mark.getExam() != null) {
            dto.setExamId(mark.getExam().getId());
            dto.setExamName(mark.getExam().getName());
        }
        if (mark.getStudent() != null) {
            dto.setStudentId(mark.getStudent().getId());
            dto.setStudentName(mark.getStudent().getFullName());
            dto.setAdmissionNumber(mark.getStudent().getAdmissionNumber());
        }
        if (mark.getSubject() != null) {
            dto.setSubjectId(mark.getSubject().getId());
            dto.setSubjectName(mark.getSubject().getName());
            dto.setSubjectCode(mark.getSubject().getCode());
        }
        dto.setScore(mark.getScore());
        dto.setGrade(mark.getGrade());
        dto.setGradeDescription(mark.getGrade() != null ? mark.getGrade().getDescription() : null);
        dto.setRemarks(mark.getRemarks());
        if (mark.getRecordedBy() != null) {
            dto.setRecordedById(mark.getRecordedBy().getId());
            dto.setRecordedByName(mark.getRecordedBy().getFullName());
        }
        dto.setCreatedAt(mark.getCreatedAt());
        dto.setUpdatedAt(mark.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public String getExamName() {
        return examName;
    }

    public void setExamName(String examName) {
        this.examName = examName;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public void setAdmissionNumber(String admissionNumber) {
        this.admissionNumber = admissionNumber;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Grade getGrade() {
        return grade;
    }

    public void setGrade(Grade grade) {
        this.grade = grade;
    }

    public String getGradeDescription() {
        return gradeDescription;
    }

    public void setGradeDescription(String gradeDescription) {
        this.gradeDescription = gradeDescription;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Long getRecordedById() {
        return recordedById;
    }

    public void setRecordedById(Long recordedById) {
        this.recordedById = recordedById;
    }

    public String getRecordedByName() {
        return recordedByName;
    }

    public void setRecordedByName(String recordedByName) {
        this.recordedByName = recordedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
