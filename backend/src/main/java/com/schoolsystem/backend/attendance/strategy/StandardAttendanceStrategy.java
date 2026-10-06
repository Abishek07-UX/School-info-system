package com.schoolsystem.backend.attendance.strategy;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Concrete Strategy: Standard Attendance Policy.
 * Default institutional policy:
 * - Computes standard percentage rate
 * - Minimum 75% attendance threshold for exam eligibility
 * - Standard qualitative rating (EXCELLENT, SATISFACTORY, WARNING, CRITICAL)
 */
@Primary
@Component("standardAttendanceStrategy")
public class StandardAttendanceStrategy implements AttendanceCalculationStrategy {

    private static final double MINIMUM_PASSING_PERCENTAGE = 75.0;

    @Override
    public double calculateAttendanceRate(long presentCount, long totalCount) {
        if (totalCount <= 0) return 0.0;
        double rate = (presentCount * 100.0) / totalCount;
        return Math.round(rate * 10.0) / 10.0;
    }

    @Override
    public boolean isEligibleForExams(double attendancePercentage) {
        return attendancePercentage >= MINIMUM_PASSING_PERCENTAGE;
    }

    @Override
    public String evaluateCompliance(double attendancePercentage) {
        if (attendancePercentage >= 90.0) return "EXCELLENT";
        if (attendancePercentage >= 75.0) return "SATISFACTORY";
        if (attendancePercentage >= 50.0) return "WARNING";
        return "CRITICAL";
    }

    @Override
    public String getStrategyName() {
        return "STANDARD";
    }
}
