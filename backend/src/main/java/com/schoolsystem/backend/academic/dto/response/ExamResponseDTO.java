package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExamResponseDTO {

    private Long id;
    private String name;
    private Integer academicYear;
    private ExamTerm term;
    private String termDisplayName;
    private Long classId;
    private String className;
    private Integer gradeLevel;
    private LocalDate startDate;
    private LocalDate endDate;
    private ExamStatus status;
    private String statusDisplayName;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ExamResponseDTO() {
    }

    public static ExamResponseDTO fromEntity(Exam exam) {
        if (exam == null) return null;
        ExamResponseDTO dto = new ExamResponseDTO();
        dto.setId(exam.getId());
        dto.setName(exam.getName());
        dto.setAcademicYear(exam.getAcademicYear());
        dto.setTerm(exam.getTerm());
        dto.setTermDisplayName(exam.getTerm() != null ? exam.getTerm().getDisplayName() : null);
        if (exam.getSchoolClass() != null) {
            dto.setClassId(exam.getSchoolClass().getId());
            dto.setClassName(exam.getSchoolClass().getName());
            dto.setGradeLevel(exam.getSchoolClass().getGradeLevel());
        } else {
            dto.setClassId(null);
            dto.setClassName("School-wide / General");
            dto.setGradeLevel(null);
        }
        dto.setStartDate(exam.getStartDate());
        dto.setEndDate(exam.getEndDate());
        dto.setStatus(exam.getStatus());
        dto.setStatusDisplayName(exam.getStatus() != null ? exam.getStatus().getDisplayName() : null);
        dto.setDescription(exam.getDescription());
        dto.setCreatedAt(exam.getCreatedAt());
        dto.setUpdatedAt(exam.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getTermDisplayName() {
        return termDisplayName;
    }

    public void setTermDisplayName(String termDisplayName) {
        this.termDisplayName = termDisplayName;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
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

    public String getStatusDisplayName() {
        return statusDisplayName;
    }

    public void setStatusDisplayName(String statusDisplayName) {
        this.statusDisplayName = statusDisplayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
