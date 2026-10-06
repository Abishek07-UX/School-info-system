package com.schoolsystem.backend.attendance.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class RecordStudentAttendanceRequest {

    @NotNull(message = "Class ID is mandatory")
    private Long classId;

    @NotNull(message = "Date is mandatory")
    private LocalDate date;

    @NotNull(message = "Attendance records list cannot be null")
    private List<StudentAttendanceItem> records;

    public static class StudentAttendanceItem {
        @NotNull(message = "Student ID is mandatory")
        private Long studentId;

        @NotNull(message = "Status is mandatory (PRESENT, ABSENT, LATE, EXCUSED)")
        private String status;

        private String remarks;

        public StudentAttendanceItem() {
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getRemarks() {
            return remarks;
        }

        public void setRemarks(String remarks) {
            this.remarks = remarks;
        }
    }

    public RecordStudentAttendanceRequest() {
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<StudentAttendanceItem> getRecords() {
        return records;
    }

    public void setRecords(List<StudentAttendanceItem> records) {
        this.records = records;
    }
}
