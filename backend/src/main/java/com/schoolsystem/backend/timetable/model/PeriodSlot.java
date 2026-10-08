package com.schoolsystem.backend.timetable.model;

import java.time.LocalTime;

public enum PeriodSlot {
    PERIOD_1(1, "Period 1", LocalTime.of(7, 50), LocalTime.of(8, 30)),
    PERIOD_2(2, "Period 2", LocalTime.of(8, 30), LocalTime.of(9, 10)),
    PERIOD_3(3, "Period 3", LocalTime.of(9, 10), LocalTime.of(9, 50)),
    PERIOD_4(4, "Period 4", LocalTime.of(9, 50), LocalTime.of(10, 30)),
    // Interval: 10:30 - 10:50 (20 min break)
    PERIOD_5(5, "Period 5", LocalTime.of(10, 50), LocalTime.of(11, 30)),
    PERIOD_6(6, "Period 6", LocalTime.of(11, 30), LocalTime.of(12, 10)),
    PERIOD_7(7, "Period 7", LocalTime.of(12, 10), LocalTime.of(12, 50)),
    PERIOD_8(8, "Period 8", LocalTime.of(12, 50), LocalTime.of(13, 30));

    private final int periodNumber;
    private final String label;
    private final LocalTime startTime;
    private final LocalTime endTime;

    PeriodSlot(int periodNumber, String label, LocalTime startTime, LocalTime endTime) {
        this.periodNumber = periodNumber;
        this.label = label;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public int getPeriodNumber() {
        return periodNumber;
    }

    public String getLabel() {
        return label;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public static PeriodSlot fromNumber(int periodNumber) {
        for (PeriodSlot slot : values()) {
            if (slot.getPeriodNumber() == periodNumber) {
                return slot;
            }
        }
        throw new IllegalArgumentException("Invalid period number: " + periodNumber + ". Expected 1 to 8.");
    }
}
