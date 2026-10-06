package com.schoolsystem.backend.attendance.strategy;

import org.springframework.stereotype.Component;

/**
 * Concrete Strategy: Strict Attendance Policy.
 * Alternative institutional policy:
 * - Requires higher threshold (85% minimum) for advanced examinations
 * - Demonstrates dynamic strategy swapping without changing service code
 */
@Component("strictAttendanceStrategy")
public class StrictAttendanceStrategy implements AttendanceCalculationStrategy {

    private static final double STRICT_PASSING_PERCENTAGE = 85.0;

    @Override
    public double calculateAttendanceRate(long presentCount, long totalCount) {
        if (totalCount <= 0) return 0.0;
        double rate = (presentCount * 100.0) / totalCount;
        return Math.round(rate * 10.0) / 10.0;
    }

    @Override
    public boolean isEligibleForExams(double attendancePercentage) {
        return attendancePercentage >= STRICT_PASSING_PERCENTAGE;
    }

    @Override
    public String evaluateCompliance(double attendancePercentage) {
        if (attendancePercentage >= 95.0) return "EXCELLENT";
        if (attendancePercentage >= 85.0) return "SATISFACTORY";
        return "CRITICAL";
    }

    @Override
    public String getStrategyName() {
        return "STRICT";
    }
}
