package com.schoolsystem.backend.academic.controller;

import com.schoolsystem.backend.academic.dto.request.BatchMarkEntryRequest;
import com.schoolsystem.backend.academic.dto.request.EnterMarkRequest;
import com.schoolsystem.backend.academic.dto.response.BatchMarkResponseDTO;
import com.schoolsystem.backend.academic.dto.response.MarkResponseDTO;
import com.schoolsystem.backend.academic.service.MarkService;
import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.security.CurrentUser;
import com.schoolsystem.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
public class MarkController {

    private final MarkService markService;

    public MarkController(MarkService markService) {
        this.markService = markService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<MarkResponseDTO> enterSingleMark(
            @Valid @RequestBody EnterMarkRequest request,
            @CurrentUser UserPrincipal currentUser
    ) {
        Long recordedById = currentUser != null ? currentUser.getId() : null;
        MarkResponseDTO result = markService.enterSingleMark(request, recordedById);
        return ApiResponse.success(result, "Mark recorded successfully");
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<BatchMarkResponseDTO> enterBatchMarks(
            @Valid @RequestBody BatchMarkEntryRequest request,
            @CurrentUser UserPrincipal currentUser
    ) {
        Long recordedById = currentUser != null ? currentUser.getId() : null;
        BatchMarkResponseDTO result = markService.enterBatchMarks(request, recordedById);
        return ApiResponse.success(result, "Batch marks recorded successfully (" + result.getSavedCount() + " students)");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<MarkResponseDTO>> getMarks(
            @RequestParam Long examId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long studentId
    ) {
        List<MarkResponseDTO> marks;
        if (subjectId != null) {
            marks = markService.getMarksForExamAndSubject(examId, subjectId);
        } else if (studentId != null) {
            marks = markService.getMarksForExamAndStudent(examId, studentId);
        } else {
            marks = markService.getMarksForExam(examId);
        }
        return ApiResponse.success(marks, "Marks retrieved successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL')")
    public ApiResponse<Void> deleteMark(@PathVariable Long id) {
        markService.deleteMark(id);
        return ApiResponse.message("Mark entry removed successfully");
    }
}
