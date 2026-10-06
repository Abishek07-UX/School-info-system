package com.schoolsystem.backend.attendance.dto.response;

import com.schoolsystem.backend.attendance.model.TeacherAttendance;
import java.time.LocalDate;

public class TeacherAttendanceDTO {

    private Long id;
    private Long teacherId;
    private String teacherName;
    private LocalDate date;
    private String checkInTime;
    private String checkOutTime;
    private String status;
    private String note;

    public TeacherAttendanceDTO() {
    }

    public TeacherAttendanceDTO(TeacherAttendance ta) {
        if (ta == null) return;
        this.id = ta.getId();
        if (ta.getTeacher() != null) {
            this.teacherId = ta.getTeacher().getId();
            this.teacherName = ta.getTeacher().getFullName();
        }
        this.date = ta.getDate();
        this.checkInTime = ta.getCheckInTime();
        this.checkOutTime = ta.getCheckOutTime();
        this.status = ta.getStatus();
        this.note = ta.getNote();
    }

    public Long getId() {
        return id;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getCheckInTime() {
        return checkInTime;
    }

    public String getCheckOutTime() {
        return checkOutTime;
    }

    public String getStatus() {
        return status;
    }

    public String getNote() {
        return note;
    }
}
