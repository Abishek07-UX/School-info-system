package com.schoolsystem.backend.attendance.dto.response;

import java.time.LocalDate;

public class AttendanceReportDTO {

    private LocalDate date;
    private long totalStudents;
    private long presentStudents;
    private long absentStudents;
    private long lateStudents;
    private double studentAttendancePercentage;

    private long totalTeachers;
    private long presentTeachers;
    private double teacherAttendancePercentage;

    public AttendanceReportDTO() {
    }

    public AttendanceReportDTO(LocalDate date, long totalStudents, long presentStudents, long absentStudents, long lateStudents,
                               long totalTeachers, long presentTeachers) {
        this.date = date;
        this.totalStudents = totalStudents;
        this.presentStudents = presentStudents;
        this.absentStudents = absentStudents;
        this.lateStudents = lateStudents;
        this.studentAttendancePercentage = totalStudents > 0 ? (presentStudents * 100.0 / totalStudents) : 0.0;
        this.totalTeachers = totalTeachers;
        this.presentTeachers = presentTeachers;
        this.teacherAttendancePercentage = totalTeachers > 0 ? (presentTeachers * 100.0 / totalTeachers) : 0.0;
    }

    public LocalDate getDate() {
        return date;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public long getPresentStudents() {
        return presentStudents;
    }

    public long getAbsentStudents() {
        return absentStudents;
    }

    public long getLateStudents() {
        return lateStudents;
    }

    public double getStudentAttendancePercentage() {
        return Math.round(studentAttendancePercentage * 10.0) / 10.0;
    }

    public long getTotalTeachers() {
        return totalTeachers;
    }

    public long getPresentTeachers() {
        return presentTeachers;
    }

    public double getTeacherAttendancePercentage() {
        return Math.round(teacherAttendancePercentage * 10.0) / 10.0;
    }
}
