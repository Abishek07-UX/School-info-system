package com.schoolsystem.backend.finance.strategy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class FeeCalculationStrategyTest {

    @Test
    @DisplayName("Standard Strategy: should calculate regular fee, outstanding balance and payment statuses")
    void standardStrategy_behavior() {
        FeeCalculationStrategy strategy = new StandardFeeCalculationStrategy();

        assertEquals("STANDARD", strategy.getStrategyName());
        assertEquals(15000.0, strategy.calculateAdjustedFee(15000.0, LocalDate.now()));
        assertEquals(5000.0, strategy.calculateOutstanding(15000.0, 10000.0));
        assertEquals(0.0, strategy.calculateOutstanding(15000.0, 16000.0));

        assertEquals("PAID", strategy.determinePaymentStatus(15000.0, 15000.0));
        assertEquals("PAID", strategy.determinePaymentStatus(15000.0, 18000.0));
        assertEquals("PARTIAL", strategy.determinePaymentStatus(15000.0, 5000.0));
        assertEquals("UNPAID", strategy.determinePaymentStatus(15000.0, 0.0));
    }

    @Test
    @DisplayName("Scholarship Strategy: should apply 50% concession on base fee")
    void scholarshipStrategy_behavior() {
        FeeCalculationStrategy strategy = new ScholarshipFeeCalculationStrategy(0.50);

        assertEquals("SCHOLARSHIP", strategy.getStrategyName());
        // Base fee: 20000.0, 50% concession -> 10000.0 adjusted fee
        Double adjustedFee = strategy.calculateAdjustedFee(20000.0, LocalDate.now());
        assertEquals(10000.0, adjustedFee);

        // Paid: 7000.0 -> outstanding: 3000.0
        assertEquals(3000.0, strategy.calculateOutstanding(adjustedFee, 7000.0));
        assertEquals("PARTIAL", strategy.determinePaymentStatus(adjustedFee, 7000.0));
        assertEquals("PAID", strategy.determinePaymentStatus(adjustedFee, 10000.0));
    }

    @Test
    @DisplayName("Late Fee Penalty Strategy: should add surcharge when past due date")
    void lateFeePenaltyStrategy_behavior() {
        FeeCalculationStrategy strategy = new LateFeePenaltyCalculationStrategy(0.10); // 10% penalty

        assertEquals("LATE_FEE_PENALTY", strategy.getStrategyName());

        LocalDate pastDueDate = LocalDate.now().minusDays(10);
        LocalDate futureDueDate = LocalDate.now().plusDays(10);

        // Past due date: 10000 + 10% = 11000
        assertEquals(11000.0, strategy.calculateAdjustedFee(10000.0, pastDueDate));

        // Future due date: no penalty -> 10000
        assertEquals(10000.0, strategy.calculateAdjustedFee(10000.0, futureDueDate));
    }

    @Test
    @DisplayName("Strategy Context: should resolve strategies dynamically and allow runtime switching")
    void strategyContext_switching() {
        StandardFeeCalculationStrategy standard = new StandardFeeCalculationStrategy();
        ScholarshipFeeCalculationStrategy scholarship = new ScholarshipFeeCalculationStrategy();
        LateFeePenaltyCalculationStrategy lateFee = new LateFeePenaltyCalculationStrategy();

        FeeStrategyContext context = new FeeStrategyContext(standard, scholarship, lateFee);

        // Default is standard
        assertEquals("STANDARD", context.getActiveStrategy().getStrategyName());

        // Dynamic lookup by name
        assertEquals("SCHOLARSHIP", context.getStrategy("SCHOLARSHIP").getStrategyName());
        assertEquals("LATE_FEE_PENALTY", context.getStrategy("LATE_FEE_PENALTY").getStrategyName());

        // Switch active strategy
        context.setActiveStrategyByName("SCHOLARSHIP");
        assertEquals("SCHOLARSHIP", context.getActiveStrategy().getStrategyName());
    }
}
