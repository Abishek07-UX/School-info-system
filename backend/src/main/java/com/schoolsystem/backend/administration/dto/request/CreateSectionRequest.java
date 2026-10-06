package com.schoolsystem.backend.administration.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateSectionRequest {

    @NotBlank(message = "Section name is mandatory")
    private String name;

    private Integer gradeLevel;

    private Long classId;

    public CreateSectionRequest() {
    }

    public CreateSectionRequest(String name, Integer gradeLevel) {
        this.name = name;
        this.gradeLevel = gradeLevel;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }
}

