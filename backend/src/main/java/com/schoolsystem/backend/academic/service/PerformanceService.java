package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.response.ClassPerformanceAnalyticsDTO;
import com.schoolsystem.backend.academic.dto.response.StudentProgressTrendDTO;

public interface PerformanceService {

    StudentProgressTrendDTO getStudentProgressTrend(Long studentId);

    ClassPerformanceAnalyticsDTO getClassPerformanceAnalytics(Long classId, Long examId);
}
