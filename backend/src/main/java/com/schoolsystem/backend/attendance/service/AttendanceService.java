package com.schoolsystem.backend.attendance.service;

import com.schoolsystem.backend.attendance.dto.request.RecordStudentAttendanceRequest;
import com.schoolsystem.backend.attendance.dto.request.RecordTeacherAttendanceRequest;
import com.schoolsystem.backend.attendance.dto.response.AttendanceReportDTO;
import com.schoolsystem.backend.attendance.dto.response.StudentAttendanceDTO;
import com.schoolsystem.backend.attendance.dto.response.TeacherAttendanceDTO;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    List<StudentAttendanceDTO> recordStudentAttendance(RecordStudentAttendanceRequest request, String userClerkId);

    List<StudentAttendanceDTO> getStudentAttendanceByClassAndDate(Long classId, LocalDate date);

    List<StudentAttendanceDTO> getStudentAttendanceHistory(Long studentId, Long classId, LocalDate from, LocalDate to);

    TeacherAttendanceDTO recordTeacherAttendance(RecordTeacherAttendanceRequest request, String userClerkId);

    List<TeacherAttendanceDTO> getTeacherAttendanceByDate(LocalDate date);

    AttendanceReportDTO getAttendanceReport(LocalDate date);
 
    void clearClassAttendance(Long classId, LocalDate date);
}
