package com.schoolsystem.backend.student.dto.response;

import com.schoolsystem.backend.student.model.Student;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class StudentResponseDTO {

    private Long id;
    private String admissionNumber;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate dob;
    private String gender;
    private String address;
    private String contactNumber;
    private String guardianName;
    private String guardianContact;

    private Long classId;
    private String className;
    private Integer gradeLevel;
    private Long sectionId;
    private String sectionName;

    private Integer admissionYear;
    private String status;
    private LocalDateTime createdAt;

    public StudentResponseDTO() {
    }

    public StudentResponseDTO(Student s) {
        if (s == null) return;
        this.id = s.getId();
        this.admissionNumber = s.getAdmissionNumber();
        this.firstName = s.getFirstName();
        this.lastName = s.getLastName();
        this.fullName = s.getFullName();
        this.dob = s.getDob();
        this.gender = s.getGender();
        this.address = s.getAddress();
        this.contactNumber = s.getContactNumber();
        this.guardianName = s.getGuardianName();
        this.guardianContact = s.getGuardianContact();
        if (s.getSchoolClass() != null) {
            this.classId = s.getSchoolClass().getId();
            this.className = s.getSchoolClass().getName();
            this.gradeLevel = s.getSchoolClass().getGradeLevel();
        }
        if (s.getSection() != null) {
            this.sectionId = s.getSection().getId();
            this.sectionName = s.getSection().getName();
        }
        this.admissionYear = s.getAdmissionYear();
        this.status = s.getStatus();
        this.createdAt = s.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getFullName() {
        return fullName;
    }

    public LocalDate getDob() {
        return dob;
    }

    public String getGender() {
        return gender;
    }

    public String getAddress() {
        return address;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public String getGuardianName() {
        return guardianName;
    }

    public String getGuardianContact() {
        return guardianContact;
    }

    public Long getClassId() {
        return classId;
    }

    public String getClassName() {
        return className;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public Integer getAdmissionYear() {
        return admissionYear;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
