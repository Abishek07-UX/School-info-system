package com.schoolsystem.backend.finance.strategy;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

/**
 * Concrete Strategy: Standard Fee Calculation.
 * Implements the standard school billing policy:
 * - Full standard fee structure amount
 * - Non-negative outstanding balance: max(0.0, totalFee - totalPaid)
 * - Standard payment status determination: PAID, PARTIAL, or UNPAID.
 */
@Primary
@Component("standardFeeStrategy")
public class StandardFeeCalculationStrategy implements FeeCalculationStrategy {

    @Override
    public Double calculateAdjustedFee(Double baseFee, LocalDate dueDate) {
        return (baseFee != null) ? baseFee : 0.0;
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
        return "STANDARD";
    }
}
