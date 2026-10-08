package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.student.model.Student;

public class StudentSummaryDTO {

    private Long id;
    private String admissionNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private String gender;
    private Long classId;
    private String className;
    private String status;

    public StudentSummaryDTO() {
    }

    public static StudentSummaryDTO fromEntity(Student s) {
        if (s == null) return null;
        StudentSummaryDTO dto = new StudentSummaryDTO();
        dto.setId(s.getId());
        dto.setAdmissionNumber(s.getAdmissionNumber());
        dto.setFirstName(s.getFirstName());
        dto.setLastName(s.getLastName());
        dto.setFullName(s.getFullName());
        dto.setGender(s.getGender());
        if (s.getSchoolClass() != null) {
            dto.setClassId(s.getSchoolClass().getId());
            dto.setClassName(s.getSchoolClass().getName());
        }
        dto.setStatus(s.getStatus());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public void setAdmissionNumber(String admissionNumber) {
        this.admissionNumber = admissionNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
