package com.schoolsystem.backend.academic.model;

public enum Grade {
    A("Distinction", 75.0, 100.0, true),
    B("Very Good", 65.0, 74.99, true),
    C("Credit / Good", 50.0, 64.99, true),
    S("Simple Pass", 35.0, 49.99, true),
    F("Fail", 0.0, 34.99, false);

    private final String description;
    private final double minScore;
    private final double maxScore;
    private final boolean passing;

    Grade(String description, double minScore, double maxScore, boolean passing) {
        this.description = description;
        this.minScore = minScore;
        this.maxScore = maxScore;
        this.passing = passing;
    }

    public static Grade fromScore(double score) {
        if (score >= 75.0) return A;
        if (score >= 65.0) return B;
        if (score >= 50.0) return C;
        if (score >= 35.0) return S;
        return F;
    }

    public String getDescription() {
        return description;
    }

    public double getMinScore() {
        return minScore;
    }

    public double getMaxScore() {
        return maxScore;
    }

    public boolean isPassing() {
        return passing;
    }
}
