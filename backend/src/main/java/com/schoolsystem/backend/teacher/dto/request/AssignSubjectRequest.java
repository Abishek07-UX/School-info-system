package com.schoolsystem.backend.teacher.dto.request;

import jakarta.validation.constraints.NotNull;

public class AssignSubjectRequest {

    @NotNull(message = "Subject ID is mandatory")
    private Long subjectId;

    @NotNull(message = "Class ID is mandatory")
    private Long classId;

    public AssignSubjectRequest() {
    }

    public AssignSubjectRequest(Long subjectId, Long classId) {
        this.subjectId = subjectId;
        this.classId = classId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }
}
