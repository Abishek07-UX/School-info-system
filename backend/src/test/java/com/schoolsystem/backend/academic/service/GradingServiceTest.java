package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.model.Grade;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class GradingServiceTest {

    private GradingService gradingService;

    @BeforeEach
    void setUp() {
        gradingService = new GradingServiceImpl();
    }

    @Test
    void testGradeBoundaries() {
        assertEquals(Grade.A, gradingService.calculateGrade(100.0));
        assertEquals(Grade.A, gradingService.calculateGrade(75.0));
        assertEquals(Grade.B, gradingService.calculateGrade(74.99));
        assertEquals(Grade.B, gradingService.calculateGrade(65.0));
        assertEquals(Grade.C, gradingService.calculateGrade(64.9));
        assertEquals(Grade.C, gradingService.calculateGrade(50.0));
        assertEquals(Grade.S, gradingService.calculateGrade(49.9));
        assertEquals(Grade.S, gradingService.calculateGrade(35.0));
        assertEquals(Grade.F, gradingService.calculateGrade(34.9));
        assertEquals(Grade.F, gradingService.calculateGrade(0.0));
    }

    @Test
    void testCalculateAverage() {
        assertEquals(85.50, gradingService.calculateAverage(513.0, 6));
        assertEquals(90.67, gradingService.calculateAverage(544.0, 6));
        assertEquals(0.0, gradingService.calculateAverage(0.0, 0));
        assertEquals(0.0, gradingService.calculateAverage(null, 5));
    }

    @Test
    void testCalculateClassRankingsUniqueScores() {
        Map<Long, Double> averages = new HashMap<>();
        averages.put(101L, 95.0);
        averages.put(102L, 88.5);
        averages.put(103L, 72.0);
        averages.put(104L, 64.0);

        Map<Long, Integer> ranks = gradingService.calculateClassRankings(averages);

        assertEquals(1, ranks.get(101L));
        assertEquals(2, ranks.get(102L));
        assertEquals(3, ranks.get(103L));
        assertEquals(4, ranks.get(104L));
    }

    @Test
    void testCalculateClassRankingsWithTies() {
        Map<Long, Double> averages = new HashMap<>();
        averages.put(101L, 90.0);
        averages.put(102L, 90.0); // Joint 1st
        averages.put(103L, 85.0); // 3rd (because two tied for 1st)
        averages.put(104L, 70.0); // 4th

        Map<Long, Integer> ranks = gradingService.calculateClassRankings(averages);

        assertEquals(1, ranks.get(101L));
        assertEquals(1, ranks.get(102L));
        assertEquals(3, ranks.get(103L));
        assertEquals(4, ranks.get(104L));
    }

    @Test
    void testDetermineOverallPassingStatus() {
        assertEquals("PASS", gradingService.determineOverallPassingStatus(78.5, 0));
        assertEquals("CONDITIONAL_PASS", gradingService.determineOverallPassingStatus(55.0, 1));
        assertEquals("FAIL", gradingService.determineOverallPassingStatus(30.0, 0));
        assertEquals("FAIL", gradingService.determineOverallPassingStatus(65.0, 2));
    }
}
