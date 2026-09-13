package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.academic.model.ExamTerm;
import java.util.List;

public class ReportCardDTO {

    // Student Info
    private Long studentId;
    private String studentName;
    private String admissionNumber;
    private String gender;

    // Class Info
    private Long classId;
    private String className;
    private Integer gradeLevel;
    private String sectionName;
    private String classTeacherName;

    // Exam Info
    private Long examId;
    private String examName;
    private Integer academicYear;
    private ExamTerm term;
    private String termDisplayName;

    // Results & Calculations
    private List<SubjectMarkDetailDTO> subjectMarks;
    private int totalSubjects;
    private int passedSubjects;
    private int failedSubjects;
    private Double totalMarks;
    private Double maxPossibleMarks;
    private Double averageScore;
    private Integer classRank;
    private int totalStudentsInClass;
    private boolean passedOverall;
    private String overallGrade;
    private String principalRemarks;

    public ReportCardDTO() {
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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
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

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public String getClassTeacherName() {
        return classTeacherName;
    }

    public void setClassTeacherName(String classTeacherName) {
        this.classTeacherName = classTeacherName;
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

    public List<SubjectMarkDetailDTO> getSubjectMarks() {
        return subjectMarks;
    }

    public void setSubjectMarks(List<SubjectMarkDetailDTO> subjectMarks) {
        this.subjectMarks = subjectMarks;
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

    public int getFailedSubjects() {
        return failedSubjects;
    }

    public void setFailedSubjects(int failedSubjects) {
        this.failedSubjects = failedSubjects;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Double getMaxPossibleMarks() {
        return maxPossibleMarks;
    }

    public void setMaxPossibleMarks(Double maxPossibleMarks) {
        this.maxPossibleMarks = maxPossibleMarks;
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

    public boolean isPassedOverall() {
        return passedOverall;
    }

    public void setPassedOverall(boolean passedOverall) {
        this.passedOverall = passedOverall;
    }

    public String getOverallGrade() {
        return overallGrade;
    }

    public void setOverallGrade(String overallGrade) {
        this.overallGrade = overallGrade;
    }

    public String getPrincipalRemarks() {
        return principalRemarks;
    }

    public void setPrincipalRemarks(String principalRemarks) {
        this.principalRemarks = principalRemarks;
    }
}
