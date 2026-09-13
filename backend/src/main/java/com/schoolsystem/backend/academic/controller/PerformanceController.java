package com.schoolsystem.backend.academic.controller;

import com.schoolsystem.backend.academic.dto.response.ClassPerformanceAnalyticsDTO;
import com.schoolsystem.backend.academic.dto.response.StudentProgressTrendDTO;
import com.schoolsystem.backend.academic.service.PerformanceService;
import com.schoolsystem.backend.common.dto.response.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<StudentProgressTrendDTO> getStudentProgressTrend(@PathVariable Long studentId) {
        StudentProgressTrendDTO trend = performanceService.getStudentProgressTrend(studentId);
        return ApiResponse.success(trend, "Student performance trend analysis retrieved successfully");
    }

    @GetMapping("/class/{classId}/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<ClassPerformanceAnalyticsDTO> getClassPerformanceAnalytics(
            @PathVariable Long classId,
            @PathVariable Long examId
    ) {
        ClassPerformanceAnalyticsDTO analytics = performanceService.getClassPerformanceAnalytics(classId, examId);
        return ApiResponse.success(analytics, "Class exam analytics and grade distributions retrieved successfully");
    }
}
