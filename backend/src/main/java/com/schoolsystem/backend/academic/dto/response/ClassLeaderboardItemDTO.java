package com.schoolsystem.backend.academic.dto.response;

public class ClassLeaderboardItemDTO {

    private Integer rank;
    private Long studentId;
    private String studentName;
    private String admissionNumber;
    private Double totalMarks;
    private Double averageScore;
    private String overallGrade;
    private int totalSubjects;
    private int passedSubjects;
    private boolean passedOverall;

    public ClassLeaderboardItemDTO() {
    }

    public ClassLeaderboardItemDTO(Integer rank, Long studentId, String studentName, String admissionNumber,
                                   Double totalMarks, Double averageScore, String overallGrade,
                                   int totalSubjects, int passedSubjects, boolean passedOverall) {
        this.rank = rank;
        this.studentId = studentId;
        this.studentName = studentName;
        this.admissionNumber = admissionNumber;
        this.totalMarks = totalMarks;
        this.averageScore = averageScore;
        this.overallGrade = overallGrade;
        this.totalSubjects = totalSubjects;
        this.passedSubjects = passedSubjects;
        this.passedOverall = passedOverall;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
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

    public String getOverallGrade() {
        return overallGrade;
    }

    public void setOverallGrade(String overallGrade) {
        this.overallGrade = overallGrade;
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

    public boolean isPassedOverall() {
        return passedOverall;
    }

    public void setPassedOverall(boolean passedOverall) {
        this.passedOverall = passedOverall;
    }
}
