package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.academic.model.ExamTerm;
import java.util.Map;

public class StudentTermTrendDTO {

    private Integer academicYear;
    private ExamTerm term;
    private String termDisplayName;
    private Long examId;
    private String examName;
    private Double averageScore;
    private Integer classRank;
    private int totalStudentsInClass;
    private Double totalMarks;
    private String overallGrade;
    private Map<String, Double> subjectScores;

    public StudentTermTrendDTO() {
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

    public int getTotalStudentsInClass() {
        return totalStudentsInClass;
    }

    public void setTotalStudentsInClass(int totalStudentsInClass) {
        this.totalStudentsInClass = totalStudentsInClass;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getOverallGrade() {
        return overallGrade;
    }

    public void setOverallGrade(String overallGrade) {
        this.overallGrade = overallGrade;
    }

    public Map<String, Double> getSubjectScores() {
        return subjectScores;
    }

    public void setSubjectScores(Map<String, Double> subjectScores) {
        this.subjectScores = subjectScores;
    }
}
