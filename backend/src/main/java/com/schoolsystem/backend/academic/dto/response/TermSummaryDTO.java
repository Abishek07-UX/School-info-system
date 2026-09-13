package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.academic.model.ExamTerm;

public class TermSummaryDTO {

    private ExamTerm term;
    private String termDisplayName;
    private Long examId;
    private String examName;
    private Double totalMarks;
    private Double averageScore;
    private Integer classRank;
    private int totalStudents;
    private int totalSubjects;
    private int passedSubjects;
    private String overallGrade;
    private boolean available;

    public TermSummaryDTO() {
    }

    public TermSummaryDTO(ExamTerm term, String termDisplayName, Long examId, String examName,
                          Double totalMarks, Double averageScore, Integer classRank,
                          int totalStudents, int totalSubjects, int passedSubjects,
                          String overallGrade, boolean available) {
        this.term = term;
        this.termDisplayName = termDisplayName;
        this.examId = examId;
        this.examName = examName;
        this.totalMarks = totalMarks;
        this.averageScore = averageScore;
        this.classRank = classRank;
        this.totalStudents = totalStudents;
        this.totalSubjects = totalSubjects;
        this.passedSubjects = passedSubjects;
        this.overallGrade = overallGrade;
        this.available = available;
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

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public Integer getClassRank() {
        return classRank;
    }

    public void setClassRank(Integer classRank) {
        this.classRank = classRank;
    }

    public int getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public int getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(int totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public int getPassedSubjects() {
        return passedSubjects;
    }

    public void setPassedSubjects(int passedSubjects) {
        this.passedSubjects = passedSubjects;
    }

    public String getOverallGrade() {
        return overallGrade;
    }

    public void setOverallGrade(String overallGrade) {
        this.overallGrade = overallGrade;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
