package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.model.Grade;
import java.util.Map;

public interface GradingService {

    Grade calculateGrade(Double score);

    Double calculateAverage(Double totalMarks, int totalSubjects);

    Map<Long, Integer> calculateClassRankings(Map<Long, Double> studentAverages);

    String determineOverallPassingStatus(Double averageScore, int failedSubjects);
}
