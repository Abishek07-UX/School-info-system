package com.schoolsystem.backend.academic.dto.response;

import java.util.List;

public class BatchMarkResponseDTO {

    private Long examId;
    private String examName;
    private Long subjectId;
    private String subjectName;
    private int savedCount;
    private List<MarkResponseDTO> savedMarks;

    public BatchMarkResponseDTO() {
    }

    public BatchMarkResponseDTO(Long examId, String examName, Long subjectId, String subjectName, int savedCount, List<MarkResponseDTO> savedMarks) {
        this.examId = examId;
        this.examName = examName;
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.savedCount = savedCount;
        this.savedMarks = savedMarks;
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

    public int getSavedCount() {
        return savedCount;
    }

    public void setSavedCount(int savedCount) {
        this.savedCount = savedCount;
    }

    public List<MarkResponseDTO> getSavedMarks() {
        return savedMarks;
    }

    public void setSavedMarks(List<MarkResponseDTO> savedMarks) {
        this.savedMarks = savedMarks;
    }
}
