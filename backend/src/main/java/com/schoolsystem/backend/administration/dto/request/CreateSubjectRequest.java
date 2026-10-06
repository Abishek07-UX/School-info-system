package com.schoolsystem.backend.administration.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateSubjectRequest {

    @NotBlank(message = "Subject name is mandatory")
    private String name;

    @NotBlank(message = "Subject code is mandatory")
    private String code;

    @NotNull(message = "Grade level is mandatory")
    private Integer gradeLevel;

    public CreateSubjectRequest() {
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
