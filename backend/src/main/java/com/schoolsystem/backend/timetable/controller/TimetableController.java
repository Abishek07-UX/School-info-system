package com.schoolsystem.backend.timetable.controller;

import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.timetable.dto.request.AutoGenerateRequest;
import com.schoolsystem.backend.timetable.dto.request.ConflictCheckRequest;
import com.schoolsystem.backend.timetable.dto.request.TimetableSlotRequest;
import com.schoolsystem.backend.timetable.dto.response.ClassTimetableResponse;
import com.schoolsystem.backend.timetable.dto.response.ConflictCheckResponse;
import com.schoolsystem.backend.timetable.dto.response.TeacherScheduleResponse;
import com.schoolsystem.backend.timetable.dto.response.TimetableAuditResponse;
import com.schoolsystem.backend.timetable.dto.response.TimetableSlotResponse;
import com.schoolsystem.backend.timetable.service.TimetableConflictService;
import com.schoolsystem.backend.timetable.service.TimetableService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetables")
public class TimetableController {

    private final TimetableService timetableService;
    private final TimetableConflictService conflictService;

    public TimetableController(TimetableService timetableService,
                               TimetableConflictService conflictService) {
        this.timetableService = timetableService;
        this.conflictService = conflictService;
    }

    @GetMapping("/classes/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<ClassTimetableResponse> getClassTimetable(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "2026") Integer academicYear) {
        ClassTimetableResponse response = timetableService.getClassTimetable(classId, academicYear);
        return ApiResponse.success(response, "Class timetable retrieved successfully");
    }

    @GetMapping("/teachers/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<TeacherScheduleResponse> getTeacherSchedule(
            @PathVariable Long teacherId,
            @RequestParam(defaultValue = "2026") Integer academicYear) {
        TeacherScheduleResponse response = timetableService.getTeacherSchedule(teacherId, academicYear);
        return ApiResponse.success(response, "Teacher schedule retrieved successfully");
    }

    @PostMapping("/check-conflict")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ConflictCheckResponse> checkConflict(@Valid @RequestBody ConflictCheckRequest request) {
        ConflictCheckResponse response = conflictService.checkConflict(request);
        return ApiResponse.success(response, response.getMessage());
    }

    @PostMapping("/slots")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TimetableSlotResponse> createSlot(@Valid @RequestBody TimetableSlotRequest request) {
        TimetableSlotResponse response = timetableService.createSlot(request);
        return ApiResponse.success(response, "Timetable slot assigned successfully");
    }

    @PutMapping("/slots/{slotId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TimetableSlotResponse> updateSlot(
            @PathVariable Long slotId,
            @Valid @RequestBody TimetableSlotRequest request) {
        TimetableSlotResponse response = timetableService.updateSlot(slotId, request);
        return ApiResponse.success(response, "Timetable slot updated successfully");
    }

    @DeleteMapping("/slots/{slotId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteSlot(@PathVariable Long slotId) {
        timetableService.deleteSlot(slotId);
        return ApiResponse.success(null, "Timetable slot removed successfully");
    }

    @DeleteMapping("/classes/{classId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> clearClassTimetable(
            @PathVariable Long classId,
            @RequestParam(defaultValue = "2026") Integer academicYear) {
        timetableService.clearClassTimetable(classId, academicYear);
        return ApiResponse.success(null, "Class timetable cleared successfully");
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<TimetableSlotResponse>> autoGenerateTimetable(@Valid @RequestBody AutoGenerateRequest request) {
        List<TimetableSlotResponse> generated = timetableService.autoGenerateTimetable(request.getClassId(), request.getAcademicYear());
        return ApiResponse.success(generated, "Conflict-free timetable generated successfully with " + generated.size() + " periods scheduled!");
    }

    @GetMapping("/conflicts/audit")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ApiResponse<TimetableAuditResponse> auditSchoolTimetable(
            @RequestParam(defaultValue = "2026") Integer academicYear) {
        TimetableAuditResponse response = timetableService.auditSchoolTimetable(academicYear);
        return ApiResponse.success(response, "School timetable audit completed");
    }
}
