package com.schoolsystem.backend.academic.controller;

import com.schoolsystem.backend.academic.dto.request.CreateExamRequest;
import com.schoolsystem.backend.academic.dto.request.CreateExamWithTimetableRequest;
import com.schoolsystem.backend.academic.dto.request.UpdateExamRequest;
import com.schoolsystem.backend.academic.dto.response.ExamResponseDTO;
import com.schoolsystem.backend.academic.dto.response.ExamWithTimetableResponseDTO;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import com.schoolsystem.backend.academic.service.ExamService;
import com.schoolsystem.backend.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<ExamResponseDTO>> getExams(
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false) ExamTerm term,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) ExamStatus status
    ) {
        List<ExamResponseDTO> exams = examService.getAllExams(academicYear, term, classId, status);
        return ApiResponse.success(exams, "Examinations retrieved successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<ExamResponseDTO> getExamById(@PathVariable Long id) {
        ExamResponseDTO exam = examService.getExamById(id);
        return ApiResponse.success(exam, "Examination details retrieved successfully");
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<ExamResponseDTO>> getExamsForClass(
            @PathVariable Long classId,
            @RequestParam(required = false) Integer academicYear
    ) {
        List<ExamResponseDTO> exams = examService.getExamsForClass(classId, academicYear);
        return ApiResponse.success(exams, "Class examinations retrieved successfully");
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ResponseEntity<ApiResponse<ExamResponseDTO>> createExam(@Valid @RequestBody CreateExamRequest request) {
        ExamResponseDTO created = examService.createExam(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Examination scheduled successfully"));
    }

    @PostMapping("/with-timetable")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ResponseEntity<ApiResponse<ExamWithTimetableResponseDTO>> createExamWithTimetable(
            @Valid @RequestBody CreateExamWithTimetableRequest request
    ) {
        ExamWithTimetableResponseDTO created = examService.createExamWithTimetable(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, created.getMessage()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<ExamResponseDTO> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExamRequest request
    ) {
        ExamResponseDTO updated = examService.updateExam(id, request);
        return ApiResponse.success(updated, "Examination updated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ApiResponse<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ApiResponse.message("Examination deleted successfully");
    }
}
