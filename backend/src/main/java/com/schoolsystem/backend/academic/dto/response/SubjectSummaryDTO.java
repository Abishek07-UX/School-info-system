package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.administration.model.Subject;

public class SubjectSummaryDTO {

    private Long id;
    private String name;
    private String code;
    private Integer gradeLevel;

    public SubjectSummaryDTO() {
    }

    public static SubjectSummaryDTO fromEntity(Subject subject) {
        if (subject == null) return null;
        SubjectSummaryDTO dto = new SubjectSummaryDTO();
        dto.setId(subject.getId());
        dto.setName(subject.getName());
        dto.setCode(subject.getCode());
        dto.setGradeLevel(subject.getGradeLevel());
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }
}
