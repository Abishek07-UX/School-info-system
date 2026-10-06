package com.schoolsystem.backend.teacher.dto.request;

public class TeacherUpdateRequest {

    private String phoneNumber;
    private String address;
    private String qualification;
    private String subjectSpecialization;
    private String teachingHistory;
    private String availability;
    private String employmentStatus;

    public TeacherUpdateRequest() {
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSubjectSpecialization() {
        return subjectSpecialization;
    }

    public void setSubjectSpecialization(String subjectSpecialization) {
        this.subjectSpecialization = subjectSpecialization;
    }

    public String getTeachingHistory() {
        return teachingHistory;
    }

    public void setTeachingHistory(String teachingHistory) {
        this.teachingHistory = teachingHistory;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }
}
