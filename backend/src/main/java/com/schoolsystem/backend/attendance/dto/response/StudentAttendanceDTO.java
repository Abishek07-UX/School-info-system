package com.schoolsystem.backend.attendance.dto.response;

import com.schoolsystem.backend.attendance.model.StudentAttendance;
import java.time.LocalDate;

public class StudentAttendanceDTO {

    private Long id;
    private Long studentId;
    private String admissionNumber;
    private String studentName;
    private Long classId;
    private String className;
    private LocalDate date;
    private String status;
    private String remarks;
    private String recordedByName;

    public StudentAttendanceDTO() {
    }

    public StudentAttendanceDTO(StudentAttendance sa) {
        if (sa == null) return;
        this.id = sa.getId();
        if (sa.getStudent() != null) {
            this.studentId = sa.getStudent().getId();
            this.admissionNumber = sa.getStudent().getAdmissionNumber();
            this.studentName = sa.getStudent().getFullName();
        }
        if (sa.getSchoolClass() != null) {
            this.classId = sa.getSchoolClass().getId();
            this.className = sa.getSchoolClass().getName();
        }
        this.date = sa.getDate();
        this.status = sa.getStatus();
        this.remarks = sa.getRemarks();
        if (sa.getRecordedBy() != null) {
            this.recordedByName = sa.getRecordedBy().getFullName();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public String getStudentName() {
        return studentName;
    }

    public Long getClassId() {
        return classId;
    }

    public String getClassName() {
        return className;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getStatus() {
        return status;
    }

    public String getRemarks() {
        return remarks;
    }

    public String getRecordedByName() {
        return recordedByName;
    }
}
