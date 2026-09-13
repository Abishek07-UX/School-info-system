package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.response.AnnualProgressDTO;
import com.schoolsystem.backend.academic.dto.response.ClassLeaderboardDTO;
import com.schoolsystem.backend.academic.dto.response.ReportCardDTO;

public interface ReportCardService {

    ReportCardDTO generateReportCard(Long studentId, Long examId);

    AnnualProgressDTO generateAnnualProgress(Long studentId, Integer academicYear, Long classId);

    ClassLeaderboardDTO generateClassLeaderboard(Long classId, Long examId);
}
