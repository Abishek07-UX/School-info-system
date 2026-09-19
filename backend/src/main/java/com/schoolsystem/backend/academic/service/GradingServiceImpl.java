package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.model.Grade;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GradingServiceImpl implements GradingService {

    @Override
    public Grade calculateGrade(Double score) {
        if (score == null) return Grade.F;
        return Grade.fromScore(score);
    }

    @Override
    public Double calculateAverage(Double totalMarks, int totalSubjects) {
        if (totalMarks == null || totalSubjects <= 0) {
            return 0.0;
        }
        double avg = totalMarks / totalSubjects;
        return BigDecimal.valueOf(avg)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    @Override
    public Map<Long, Integer> calculateClassRankings(Map<Long, Double> studentAverages) {
        if (studentAverages == null || studentAverages.isEmpty()) {
            return Collections.emptyMap();
        }

        // Sort students by average score descending
        List<Map.Entry<Long, Double>> sortedStudents = studentAverages.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .collect(Collectors.toList());

        Map<Long, Integer> rankings = new HashMap<>();
        int currentRank = 1;
        Double previousScore = null;
        int studentsAtPreviousScore = 0;

        for (int i = 0; i < sortedStudents.size(); i++) {
            Map.Entry<Long, Double> entry = sortedStudents.get(i);
            Double score = entry.getValue();

            if (previousScore == null) {
                currentRank = 1;
                studentsAtPreviousScore = 1;
            } else if (Math.abs(score - previousScore) < 0.001) {
                // Same score as previous student -> same rank
                studentsAtPreviousScore++;
            } else {
                // Different score -> rank advances by number of preceding students
                currentRank = currentRank + studentsAtPreviousScore;
                studentsAtPreviousScore = 1;
            }

            rankings.put(entry.getKey(), currentRank);
            previousScore = score;
        }

        return rankings;
    }

    @Override
    public String determineOverallPassingStatus(Double averageScore, int failedSubjects) {
        if (averageScore == null) return "FAIL";
        if (failedSubjects == 0 && averageScore >= 35.0) {
            return "PASS";
        }
        if (failedSubjects <= 1 && averageScore >= 50.0) {
            return "CONDITIONAL_PASS";
        }
        return "FAIL";
    }
}
