package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.academic.model.Grade;

public class SubjectMarkDetailDTO {

    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private Double score;
    private Grade grade;
    private String gradeDescription;
    private boolean passing;
    private String remarks;
    private String teacherName;

    public SubjectMarkDetailDTO() {
    }

    public SubjectMarkDetailDTO(Long subjectId, String subjectName, String subjectCode,
                                Double score, Grade grade, String gradeDescription,
                                boolean passing, String remarks, String teacherName) {
        this.subjectId = subjectId;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.score = score;
        this.grade = grade;
        this.gradeDescription = gradeDescription;
        this.passing = passing;
        this.remarks = remarks;
        this.teacherName = teacherName;
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

    public boolean isPassing() {
        return passing;
    }

    public void setPassing(boolean passing) {
        this.passing = passing;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }
}
