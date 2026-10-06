package com.schoolsystem.backend.attendance.controller;

import com.schoolsystem.backend.attendance.dto.request.RecordStudentAttendanceRequest;
import com.schoolsystem.backend.attendance.dto.request.RecordTeacherAttendanceRequest;
import com.schoolsystem.backend.attendance.dto.response.AttendanceReportDTO;
import com.schoolsystem.backend.attendance.dto.response.StudentAttendanceDTO;
import com.schoolsystem.backend.attendance.dto.response.TeacherAttendanceDTO;
import com.schoolsystem.backend.attendance.service.AttendanceService;
import com.schoolsystem.backend.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/students")
    public ApiResponse<List<StudentAttendanceDTO>> recordStudentAttendance(
            @Valid @RequestBody RecordStudentAttendanceRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String clerkId = (jwt != null) ? jwt.getSubject() : null;
        List<StudentAttendanceDTO> recorded = attendanceService.recordStudentAttendance(request, clerkId);
        return ApiResponse.success(recorded, "Student attendance recorded successfully");
    }

    @GetMapping("/students")
    public ApiResponse<List<StudentAttendanceDTO>> getStudentAttendance(
            @RequestParam Long classId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<StudentAttendanceDTO> list = attendanceService.getStudentAttendanceByClassAndDate(classId, targetDate);
        return ApiResponse.success(list, "Class attendance retrieved successfully");
    }

    @PostMapping("/teachers")
    public ApiResponse<TeacherAttendanceDTO> recordTeacherAttendance(
            @Valid @RequestBody RecordTeacherAttendanceRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String clerkId = (jwt != null) ? jwt.getSubject() : null;
        TeacherAttendanceDTO recorded = attendanceService.recordTeacherAttendance(request, clerkId);
        return ApiResponse.success(recorded, "Teacher attendance recorded successfully");
    }

    @GetMapping("/teachers")
    public ApiResponse<List<TeacherAttendanceDTO>> getTeacherAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        List<TeacherAttendanceDTO> list = attendanceService.getTeacherAttendanceByDate(targetDate);
        return ApiResponse.success(list, "Teacher attendance retrieved successfully");
    }

    @GetMapping("/reports")
    public ApiResponse<AttendanceReportDTO> getAttendanceReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        AttendanceReportDTO report = attendanceService.getAttendanceReport(date);
        return ApiResponse.success(report, "Attendance summary report generated");
    }

    @GetMapping("/history")
    public ApiResponse<List<StudentAttendanceDTO>> getAttendanceHistory(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        List<StudentAttendanceDTO> history = attendanceService.getStudentAttendanceHistory(studentId, classId, from, to);
        return ApiResponse.success(history, "Attendance history retrieved successfully");
    }

    @DeleteMapping("/classes/{classId}")
    public ApiResponse<Void> clearClassAttendance(
            @PathVariable Long classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        attendanceService.clearClassAttendance(classId, date);
        return ApiResponse.message("Class attendance session reset successfully");
    }
}
