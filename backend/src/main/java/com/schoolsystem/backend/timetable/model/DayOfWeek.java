package com.schoolsystem.backend.timetable.model;

public enum DayOfWeek {
    MONDAY("Monday", 1),
    TUESDAY("Tuesday", 2),
    WEDNESDAY("Wednesday", 3),
    THURSDAY("Thursday", 4),
    FRIDAY("Friday", 5);

    private final String displayName;
    private final int dayIndex;

    DayOfWeek(String displayName, int dayIndex) {
        this.displayName = displayName;
        this.dayIndex = dayIndex;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getDayIndex() {
        return dayIndex;
    }
}
