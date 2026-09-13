package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.academic.model.ExamTerm;
import java.util.List;

public class ClassLeaderboardDTO {

    private Long classId;
    private String className;
    private Integer gradeLevel;
    private Long examId;
    private String examName;
    private Integer academicYear;
    private ExamTerm term;
    private String termDisplayName;
    private int totalStudents;
    private Double classAverage;
    private Double highestAverage;
    private Double lowestAverage;
    private int totalPassed;
    private Double passRate;
    private List<ClassLeaderboardItemDTO> rankings;

    public ClassLeaderboardDTO() {
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

    public Double getClassAverage() {
        return classAverage;
    }

    public void setClassAverage(Double classAverage) {
        this.classAverage = classAverage;
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

    public int getTotalPassed() {
        return totalPassed;
    }

    public void setTotalPassed(int totalPassed) {
        this.totalPassed = totalPassed;
    }

    public Double getPassRate() {
        return passRate;
    }

    public void setPassRate(Double passRate) {
        this.passRate = passRate;
    }

    public List<ClassLeaderboardItemDTO> getRankings() {
        return rankings;
    }

    public void setRankings(List<ClassLeaderboardItemDTO> rankings) {
        this.rankings = rankings;
    }
}
