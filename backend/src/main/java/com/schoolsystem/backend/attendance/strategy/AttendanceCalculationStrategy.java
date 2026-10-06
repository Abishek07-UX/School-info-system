package com.schoolsystem.backend.attendance.strategy;

/**
 * Strategy interface in the Strategy Pattern.
 * Defines the contract for interchangeable attendance rate calculation
 * and compliance evaluation algorithms (e.g. Standard 75% vs Strict 85% policy).
 */
public interface AttendanceCalculationStrategy {

    /**
     * Calculates the attendance compliance rate percentage.
     *
     * @param presentCount number of attendees marked present
     * @param totalCount   total registered attendees
     * @return percentage rounded to 1 decimal place
     */
    double calculateAttendanceRate(long presentCount, long totalCount);

    /**
     * Checks if attendance meets the threshold required for exam eligibility.
     *
     * @param attendancePercentage calculated percentage
     * @return true if eligible
     */
    boolean isEligibleForExams(double attendancePercentage);

    /**
     * Evaluates compliance rating ("EXCELLENT", "SATISFACTORY", "WARNING", "CRITICAL").
     *
     * @param attendancePercentage calculated percentage
     * @return compliance rating string
     */
    String evaluateCompliance(double attendancePercentage);

    /**
     * Unique strategy identifier.
     */
    String getStrategyName();
}
