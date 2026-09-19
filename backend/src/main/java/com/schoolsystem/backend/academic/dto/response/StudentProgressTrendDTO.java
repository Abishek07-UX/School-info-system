package com.schoolsystem.backend.academic.dto.response;

import java.util.List;

public class StudentProgressTrendDTO {

    private Long studentId;
    private String studentName;
    private String admissionNumber;
    private String currentClassName;
    private List<StudentTermTrendDTO> termTrends;
    private String progressTrajectory; // "IMPROVING", "DECLINING", "CONSISTENT"
    private String strongestSubject;
    private String weakestSubject;

    public StudentProgressTrendDTO() {
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

    public String getCurrentClassName() {
        return currentClassName;
    }

    public void setCurrentClassName(String currentClassName) {
        this.currentClassName = currentClassName;
    }

    public List<StudentTermTrendDTO> getTermTrends() {
        return termTrends;
    }

    public void setTermTrends(List<StudentTermTrendDTO> termTrends) {
        this.termTrends = termTrends;
    }

    public String getProgressTrajectory() {
        return progressTrajectory;
    }

    public void setProgressTrajectory(String progressTrajectory) {
        this.progressTrajectory = progressTrajectory;
    }

    public String getStrongestSubject() {
        return strongestSubject;
    }

    public void setStrongestSubject(String strongestSubject) {
        this.strongestSubject = strongestSubject;
    }

    public String getWeakestSubject() {
        return weakestSubject;
    }

    public void setWeakestSubject(String weakestSubject) {
        this.weakestSubject = weakestSubject;
    }
}
