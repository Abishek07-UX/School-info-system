package com.schoolsystem.backend.teacher.dto.response;

import com.schoolsystem.backend.teacher.model.TeacherSubject;
import com.schoolsystem.backend.user.model.User;

import java.util.ArrayList;
import java.util.List;

public class TeacherDTO {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String nicNumber;
    private String address;
    private String status;
    private String qualification;
    private String subjectSpecialization;
    private String assignedClass;
    private String teachingHistory;
    private String availability;
    private String employmentStatus;
    private List<SubjectAssignmentDTO> assignments = new ArrayList<>();

    public static class SubjectAssignmentDTO {
        private Long id;
        private Long subjectId;
        private String subjectName;
        private String subjectCode;
        private Long classId;
        private String className;

        public SubjectAssignmentDTO() {
        }

        public SubjectAssignmentDTO(TeacherSubject ts) {
            if (ts == null) return;
            this.id = ts.getId();
            if (ts.getSubject() != null) {
                this.subjectId = ts.getSubject().getId();
                this.subjectName = ts.getSubject().getName();
                this.subjectCode = ts.getSubject().getCode();
            }
            if (ts.getSchoolClass() != null) {
                this.classId = ts.getSchoolClass().getId();
                this.className = ts.getSchoolClass().getName();
            }
        }

        public Long getId() {
            return id;
        }

        public Long getSubjectId() {
            return subjectId;
        }

        public String getSubjectName() {
            return subjectName;
        }

        public String getSubjectCode() {
            return subjectCode;
        }

        public Long getClassId() {
            return classId;
        }

        public String getClassName() {
            return className;
        }
    }

    public TeacherDTO() {
    }

    public TeacherDTO(User user, List<TeacherSubject> tsList) {
        if (user == null) return;
        this.id = user.getId();
        this.name = user.getFullName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.nicNumber = user.getNicNumber();
        this.address = user.getAddress();
        this.status = user.getStatus() != null ? user.getStatus().name() : "ACTIVE";
        if (tsList != null) {
            for (TeacherSubject ts : tsList) {
                this.assignments.add(new SubjectAssignmentDTO(ts));
            }
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getNicNumber() {
        return nicNumber;
    }

    public String getAddress() {
        return address;
    }

    public String getStatus() {
        return status;
    }

    public List<SubjectAssignmentDTO> getAssignments() {
        return assignments;
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

    public String getAssignedClass() {
        return assignedClass;
    }

    public void setAssignedClass(String assignedClass) {
        this.assignedClass = assignedClass;
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
