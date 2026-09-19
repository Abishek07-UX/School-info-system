package com.schoolsystem.backend.academic.dto.response;

import java.util.List;

public class AnnualProgressDTO {

    private Long studentId;
    private String studentName;
    private String admissionNumber;
    private Long classId;
    private String className;
    private Integer academicYear;

    private TermSummaryDTO term1;
    private TermSummaryDTO term2;
    private TermSummaryDTO term3;

    private Double annualAverage;
    private Integer annualRank;
    private int totalStudentsInClass;
    private String annualStatus;
    private String overallGrade;

    public AnnualProgressDTO() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public void setAdmissionNumber(String admissionNumber) {
        this.admissionNumber = admissionNumber;
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

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public TermSummaryDTO getTerm1() {
        return term1;
    }

    public void setTerm1(TermSummaryDTO term1) {
        this.term1 = term1;
    }

    public TermSummaryDTO getTerm2() {
        return term2;
    }

    public void setTerm2(TermSummaryDTO term2) {
        this.term2 = term2;
    }

    public TermSummaryDTO getTerm3() {
        return term3;
    }

    public void setTerm3(TermSummaryDTO term3) {
        this.term3 = term3;
    }

    public Double getAnnualAverage() {
        return annualAverage;
    }

    public void setAnnualAverage(Double annualAverage) {
        this.annualAverage = annualAverage;
    }

    public Integer getAnnualRank() {
        return annualRank;
    }

    public void setAnnualRank(Integer annualRank) {
        this.annualRank = annualRank;
    }

    public int getTotalStudentsInClass() {
        return totalStudentsInClass;
    }

    public void setTotalStudentsInClass(int totalStudentsInClass) {
        this.totalStudentsInClass = totalStudentsInClass;
    }

    public String getAnnualStatus() {
        return annualStatus;
    }

    public void setAnnualStatus(String annualStatus) {
        this.annualStatus = annualStatus;
    }

    public String getOverallGrade() {
        return overallGrade;
    }

    public void setOverallGrade(String overallGrade) {
        this.overallGrade = overallGrade;
    }
}
