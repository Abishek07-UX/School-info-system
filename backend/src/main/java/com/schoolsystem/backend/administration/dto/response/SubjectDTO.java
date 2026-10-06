package com.schoolsystem.backend.administration.dto.response;

import com.schoolsystem.backend.administration.model.Subject;

public class SubjectDTO {

    private Long id;
    private String name;
    private String code;
    private Integer gradeLevel;

    public SubjectDTO() {
    }

    public SubjectDTO(Subject s) {
        if (s == null) return;
        this.id = s.getId();
        this.name = s.getName();
        this.code = s.getCode();
        this.gradeLevel = s.getGradeLevel();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }
}
