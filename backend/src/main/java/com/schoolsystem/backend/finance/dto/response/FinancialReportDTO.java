package com.schoolsystem.backend.finance.dto.response;

import java.util.Map;

public class FinancialReportDTO {

    private Double totalCollected;
    private Double totalOutstanding;
    private long totalTransactions;
    private Map<String, Double> termBreakdown;

    private Double totalExpectedRevenue;
    private Double totalCollectedRevenue;
    private Double totalOutstandingDues;
    private Double collectionRatePercentage;

    public FinancialReportDTO() {
    }

    public FinancialReportDTO(Double totalCollected, Double totalOutstanding, long totalTransactions, Map<String, Double> termBreakdown) {
        this.totalCollected = totalCollected != null ? Math.round(totalCollected * 100.0) / 100.0 : 0.0;
        this.totalOutstanding = totalOutstanding != null ? Math.round(totalOutstanding * 100.0) / 100.0 : 0.0;
        this.totalTransactions = totalTransactions;
        this.termBreakdown = termBreakdown;

        this.totalCollectedRevenue = this.totalCollected;
        this.totalOutstandingDues = this.totalOutstanding;
        this.totalExpectedRevenue = Math.round((this.totalCollected + this.totalOutstanding) * 100.0) / 100.0;
        if (this.totalExpectedRevenue > 0) {
            this.collectionRatePercentage = Math.round((this.totalCollected / this.totalExpectedRevenue) * 1000.0) / 10.0;
        } else {
            this.collectionRatePercentage = 0.0;
        }
    }

    public Double getTotalCollected() {
        return totalCollected;
    }

    public Double getTotalOutstanding() {
        return totalOutstanding;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public Map<String, Double> getTermBreakdown() {
        return termBreakdown;
    }

    public Double getTotalExpectedRevenue() {
        return totalExpectedRevenue;
    }

    public Double getTotalCollectedRevenue() {
        return totalCollectedRevenue;
    }

    public Double getTotalOutstandingDues() {
        return totalOutstandingDues;
    }

    public Double getCollectionRatePercentage() {
        return collectionRatePercentage;
    }
}
