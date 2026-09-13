package com.schoolsystem.backend.academic.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class BatchMarkEntryRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotEmpty(message = "Mark items list cannot be empty")
    @Valid
    private List<MarkItemDTO> marks;

    public BatchMarkEntryRequest() {
    }

    public BatchMarkEntryRequest(Long examId, Long subjectId, List<MarkItemDTO> marks) {
        this.examId = examId;
        this.subjectId = subjectId;
        this.marks = marks;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public List<MarkItemDTO> getMarks() {
        return marks;
    }

    public void setMarks(List<MarkItemDTO> marks) {
        this.marks = marks;
    }
}
