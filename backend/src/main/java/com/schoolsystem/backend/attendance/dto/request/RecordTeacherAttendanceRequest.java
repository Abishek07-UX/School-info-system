package com.schoolsystem.backend.attendance.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class RecordTeacherAttendanceRequest {

    @NotNull(message = "Teacher ID is mandatory")
    private Long teacherId;

    @NotNull(message = "Date is mandatory")
    private LocalDate date;

    private String checkInTime;
    private String checkOutTime;

    @NotNull(message = "Status is mandatory (PRESENT, ABSENT, LATE, ON_LEAVE)")
    private String status;

    private String note;

    public RecordTeacherAttendanceRequest() {
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(String checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(String checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
