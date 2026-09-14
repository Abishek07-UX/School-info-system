package com.schoolsystem.backend.academic.model;

public enum ExamTerm {
    TERM_1("Term 1 (First Term)"),
    TERM_2("Term 2 (Second Term)"),
    TERM_3("Term 3 (Third / Final Term)"),
    OTHER("Other / School-wide Examination");

    private final String displayName;

    ExamTerm(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
