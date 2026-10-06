package com.schoolsystem.backend.finance.strategy;

import java.time.LocalDate;

/**
 * Strategy interface in the Strategy Pattern.
 * Defines the contract for interchangeable fee calculation and payment status algorithms.
 * Allows different pricing policies (e.g. Standard, Scholarship Concession, Late Penalty)
 * to be swapped without modifying the core FinanceService logic.
 */
public interface FeeCalculationStrategy {

    /**
     * Calculates the adjusted total fee based on policy rules (e.g. discounts, late surcharges).
     *
     * @param baseFee the base fee configured in the fee structure
     * @param dueDate the payment due date
     * @return the adjusted fee amount
     */
    Double calculateAdjustedFee(Double baseFee, LocalDate dueDate);

    /**
     * Calculates the remaining outstanding balance given the total fee and total paid amount.
     *
     * @param totalFee  the total fee payable
     * @param totalPaid the amount paid so far
     * @return the non-negative remaining balance
     */
    Double calculateOutstanding(Double totalFee, Double totalPaid);

    /**
     * Evaluates and assigns the payment status ("PAID", "PARTIAL", or "UNPAID").
     *
     * @param totalFee  the total fee payable
     * @param totalPaid the amount paid so far
     * @return the payment status string
     */
    String determinePaymentStatus(Double totalFee, Double totalPaid);

    /**
     * Returns the unique identifier for this strategy.
     *
     * @return strategy name (e.g. "STANDARD", "SCHOLARSHIP", "LATE_FEE_PENALTY")
     */
    String getStrategyName();
}
