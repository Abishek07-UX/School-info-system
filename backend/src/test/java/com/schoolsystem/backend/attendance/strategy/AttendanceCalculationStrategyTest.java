package com.schoolsystem.backend.attendance.strategy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AttendanceCalculationStrategyTest {

    @Test
    @DisplayName("Standard Strategy: should calculate compliance rate, 75% exam eligibility, and status ratings")
    void standardStrategy_behavior() {
        AttendanceCalculationStrategy strategy = new StandardAttendanceStrategy();

        assertEquals("STANDARD", strategy.getStrategyName());
        assertEquals(90.0, strategy.calculateAttendanceRate(90, 100));
        assertEquals(0.0, strategy.calculateAttendanceRate(0, 0));

        // 75% standard threshold
        assertTrue(strategy.isEligibleForExams(75.0));
        assertTrue(strategy.isEligibleForExams(85.0));
        assertFalse(strategy.isEligibleForExams(74.9));

        assertEquals("EXCELLENT", strategy.evaluateCompliance(92.0));
        assertEquals("SATISFACTORY", strategy.evaluateCompliance(78.0));
        assertEquals("WARNING", strategy.evaluateCompliance(65.0));
        assertEquals("CRITICAL", strategy.evaluateCompliance(40.0));
    }

    @Test
    @DisplayName("Strict Strategy: should require higher 85% attendance for exam eligibility")
    void strictStrategy_behavior() {
        AttendanceCalculationStrategy strategy = new StrictAttendanceStrategy();

        assertEquals("STRICT", strategy.getStrategyName());
        assertEquals(85.0, strategy.calculateAttendanceRate(85, 100));

        // 85% strict threshold
        assertTrue(strategy.isEligibleForExams(85.0));
        assertFalse(strategy.isEligibleForExams(84.9));
        assertFalse(strategy.isEligibleForExams(75.0));

        assertEquals("EXCELLENT", strategy.evaluateCompliance(96.0));
        assertEquals("SATISFACTORY", strategy.evaluateCompliance(86.0));
        assertEquals("CRITICAL", strategy.evaluateCompliance(80.0));
    }
}
