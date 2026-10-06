package com.schoolsystem.backend.finance.strategy;

import org.springframework.stereotype.Component;
import java.time.LocalDate;

/**
 * Concrete Strategy: Late Fee Penalty Calculation.
 * Implements a penalty policy where overdue payments past the due date incur a surcharge (e.g. 5%).
 */
@Component("lateFeePenaltyStrategy")
public class LateFeePenaltyCalculationStrategy implements FeeCalculationStrategy {

    private final double penaltyRate;

    public LateFeePenaltyCalculationStrategy() {
        this(0.05); // Default 5% late penalty
    }

    public LateFeePenaltyCalculationStrategy(double penaltyRate) {
        this.penaltyRate = (penaltyRate >= 0.0) ? penaltyRate : 0.05;
    }

    @Override
    public Double calculateAdjustedFee(Double baseFee, LocalDate dueDate) {
        if (baseFee == null) return 0.0;
        if (dueDate != null && LocalDate.now().isAfter(dueDate)) {
            return baseFee * (1.0 + penaltyRate);
        }
        return baseFee;
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
        return "LATE_FEE_PENALTY";
    }

    public double getPenaltyRate() {
        return penaltyRate;
    }
}
