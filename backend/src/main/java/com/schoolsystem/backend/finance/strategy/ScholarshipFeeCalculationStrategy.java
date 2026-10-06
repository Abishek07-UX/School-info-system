package com.schoolsystem.backend.finance.strategy;

import org.springframework.stereotype.Component;
import java.time.LocalDate;

/**
 * Concrete Strategy: Scholarship / Concession Fee Calculation.
 * Implements a concession policy for scholarship students (e.g. 50% tuition reduction).
 * Demonstrates open-closed extensibility by allowing alternative billing policies
 * without modifying any service or controller code.
 */
@Component("scholarshipFeeStrategy")
public class ScholarshipFeeCalculationStrategy implements FeeCalculationStrategy {

    private final double discountRate;

    public ScholarshipFeeCalculationStrategy() {
        this(0.50); // Default 50% scholarship concession
    }

    public ScholarshipFeeCalculationStrategy(double discountRate) {
        this.discountRate = (discountRate >= 0.0 && discountRate <= 1.0) ? discountRate : 0.50;
    }

    @Override
    public Double calculateAdjustedFee(Double baseFee, LocalDate dueDate) {
        if (baseFee == null) return 0.0;
        return Math.max(0.0, baseFee * (1.0 - discountRate));
    }

    @Override
    public Double calculateOutstanding(Double totalFee, Double totalPaid) {
        double fee = (totalFee != null) ? totalFee : 0.0;
        double paid = (totalPaid != null) ? totalPaid : 0.0;
        return Math.max(0.0, fee - paid);
    }

    @Override
    public String determinePaymentStatus(Double totalFee, Double totalPaid) {
        double fee = (totalFee != null) ? totalFee : 0.0;
        double paid = (totalPaid != null) ? totalPaid : 0.0;

        if (paid >= fee && fee > 0.0) {
            return "PAID";
        } else if (paid > 0.0) {
            return "PARTIAL";
        } else {
            return "UNPAID";
        }
    }

    @Override
    public String getStrategyName() {
        return "SCHOLARSHIP";
    }

    public double getDiscountRate() {
        return discountRate;
    }
}
