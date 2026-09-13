package com.schoolsystem.backend.academic.controller;

import com.schoolsystem.backend.academic.dto.response.AnnualProgressDTO;
import com.schoolsystem.backend.academic.dto.response.ClassLeaderboardDTO;
import com.schoolsystem.backend.academic.dto.response.ReportCardDTO;
import com.schoolsystem.backend.academic.service.ReportCardService;
import com.schoolsystem.backend.common.dto.response.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report-cards")
public class ReportCardController {

    private final ReportCardService reportCardService;

    public ReportCardController(ReportCardService reportCardService) {
        this.reportCardService = reportCardService;
    }

    @GetMapping("/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<ReportCardDTO> getReportCard(
            @PathVariable Long studentId,
            @RequestParam Long examId
    ) {
        ReportCardDTO reportCard = reportCardService.generateReportCard(studentId, examId);
        return ApiResponse.success(reportCard, "Student report card generated successfully");
    }

    @GetMapping("/{studentId}/annual")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<AnnualProgressDTO> getAnnualProgress(
            @PathVariable Long studentId,
            @RequestParam Integer academicYear,
            @RequestParam(required = false) Long classId
    ) {
        AnnualProgressDTO progress = reportCardService.generateAnnualProgress(studentId, academicYear, classId);
        return ApiResponse.success(progress, "Annual 3-term student progression generated successfully");
    }

    @GetMapping("/class/{classId}/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<ClassLeaderboardDTO> getClassLeaderboard(
            @PathVariable Long classId,
            @PathVariable Long examId
    ) {
        ClassLeaderboardDTO leaderboard = reportCardService.generateClassLeaderboard(classId, examId);
        return ApiResponse.success(leaderboard, "Class leaderboard and rankings generated successfully");
    }
}
