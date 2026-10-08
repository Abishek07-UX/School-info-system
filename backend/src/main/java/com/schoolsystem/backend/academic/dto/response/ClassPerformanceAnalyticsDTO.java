package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.academic.model.ExamTerm;
import java.util.List;
import java.util.Map;

public class ClassPerformanceAnalyticsDTO {

    private Long classId;
    private String className;
    private Integer gradeLevel;
    private Long examId;
    private String examName;
    private Integer academicYear;
    private ExamTerm term;
    private String termDisplayName;
    private int totalStudents;
    private Double overallClassAverage;
    private Double highestAverage;
    private Double lowestAverage;
    private Double overallPassRate;
    private Map<String, Integer> overallGradeDistribution;
    private List<SubjectPerformanceDTO> subjectPerformances;

    public ClassPerformanceAnalyticsDTO() {
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
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

    public int getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Double getOverallClassAverage() {
        return overallClassAverage;
    }

    public void setOverallClassAverage(Double overallClassAverage) {
        this.overallClassAverage = overallClassAverage;
    }

    public Double getHighestAverage() {
        return highestAverage;
    }

    public void setHighestAverage(Double highestAverage) {
        this.highestAverage = highestAverage;
    }

    public Double getLowestAverage() {
        return lowestAverage;
    }

    public void setLowestAverage(Double lowestAverage) {
        this.lowestAverage = lowestAverage;
    }

    public Double getOverallPassRate() {
        return overallPassRate;
    }

    public void setOverallPassRate(Double overallPassRate) {
        this.overallPassRate = overallPassRate;
    }

    public Map<String, Integer> getOverallGradeDistribution() {
        return overallGradeDistribution;
    }

    public void setOverallGradeDistribution(Map<String, Integer> overallGradeDistribution) {
        this.overallGradeDistribution = overallGradeDistribution;
    }

    public List<SubjectPerformanceDTO> getSubjectPerformances() {
        return subjectPerformances;
    }

    public void setSubjectPerformances(List<SubjectPerformanceDTO> subjectPerformances) {
        this.subjectPerformances = subjectPerformances;
    }
}
