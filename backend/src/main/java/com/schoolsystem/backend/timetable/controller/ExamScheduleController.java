package com.schoolsystem.backend.timetable.controller;

import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.timetable.dto.request.ExamConflictCheckRequest;
import com.schoolsystem.backend.timetable.dto.request.ExamScheduleRequest;
import com.schoolsystem.backend.timetable.dto.response.ExamConflictCheckResponse;
import com.schoolsystem.backend.timetable.dto.response.ExamScheduleResponse;
import com.schoolsystem.backend.timetable.service.ExamConflictService;
import com.schoolsystem.backend.timetable.service.ExamScheduleService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam-schedules")
public class ExamScheduleController {

    private final ExamScheduleService examScheduleService;
    private final ExamConflictService examConflictService;

    public ExamScheduleController(ExamScheduleService examScheduleService,
                                  ExamConflictService examConflictService) {
        this.examScheduleService = examScheduleService;
        this.examConflictService = examConflictService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<ExamScheduleResponse>> getExamSchedules(@RequestParam Long examId) {
        List<ExamScheduleResponse> schedules = examScheduleService.getSchedulesForExam(examId);
        return ApiResponse.success(schedules, "Exam schedules retrieved successfully");
    }

    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<ExamScheduleResponse>> getClassExamDateSheet(
            @PathVariable Long classId,
            @RequestParam Long examId) {
        List<ExamScheduleResponse> schedules = examScheduleService.getSchedulesForClass(classId, examId);
        return ApiResponse.success(schedules, "Class exam date sheet retrieved successfully");
    }

    @GetMapping("/invigilators/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<ExamScheduleResponse>> getInvigilatorDuties(@PathVariable Long teacherId) {
        List<ExamScheduleResponse> schedules = examScheduleService.getInvigilatorDuties(teacherId);
        return ApiResponse.success(schedules, "Invigilation duties retrieved successfully");
    }

    @PostMapping("/check-conflict")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ExamConflictCheckResponse> checkConflict(@Valid @RequestBody ExamConflictCheckRequest request) {
        ExamConflictCheckResponse response = examConflictService.checkConflict(request);
        return ApiResponse.success(response, response.getMessage());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ExamScheduleResponse> createExamSchedule(@Valid @RequestBody ExamScheduleRequest request) {
        ExamScheduleResponse response = examScheduleService.createExamSchedule(request);
        return ApiResponse.success(response, "Exam schedule slot created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ExamScheduleResponse> updateExamSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ExamScheduleRequest request) {
        ExamScheduleResponse response = examScheduleService.updateExamSchedule(id, request);
        return ApiResponse.success(response, "Exam schedule slot updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteExamSchedule(@PathVariable Long id) {
        examScheduleService.deleteExamSchedule(id);
        return ApiResponse.success(null, "Exam schedule slot removed successfully");
    }
}
