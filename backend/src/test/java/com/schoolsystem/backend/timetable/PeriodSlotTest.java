package com.schoolsystem.backend.timetable;

import com.schoolsystem.backend.timetable.model.PeriodSlot;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

class PeriodSlotTest {

    @Test
    @DisplayName("Should verify exact 07:50 start and 40-minute periods")
    void testPeriodSlotsTiming() {
        assertEquals(8, PeriodSlot.values().length);

        // Period 1: 07:50 - 08:30
        PeriodSlot p1 = PeriodSlot.PERIOD_1;
        assertEquals(LocalTime.of(7, 50), p1.getStartTime());
        assertEquals(LocalTime.of(8, 30), p1.getEndTime());

        // Period 4: 09:50 - 10:30 (before interval)
        PeriodSlot p4 = PeriodSlot.PERIOD_4;
        assertEquals(LocalTime.of(9, 50), p4.getStartTime());
        assertEquals(LocalTime.of(10, 30), p4.getEndTime());

        // Period 5: 10:50 - 11:30 (after 20-min interval from 10:30 to 10:50)
        PeriodSlot p5 = PeriodSlot.PERIOD_5;
        assertEquals(LocalTime.of(10, 50), p5.getStartTime());
        assertEquals(LocalTime.of(11, 30), p5.getEndTime());

        // Period 8: 12:50 - 13:30 (final school period)
        PeriodSlot p8 = PeriodSlot.PERIOD_8;
        assertEquals(LocalTime.of(12, 50), p8.getStartTime());
        assertEquals(LocalTime.of(13, 30), p8.getEndTime());
    }

    @Test
    @DisplayName("Should lookup period by integer number 1 to 8")
    void testLookupByNumber() {
        assertEquals(PeriodSlot.PERIOD_1, PeriodSlot.fromNumber(1));
        assertEquals(PeriodSlot.PERIOD_8, PeriodSlot.fromNumber(8));

        assertThrows(IllegalArgumentException.class, () -> PeriodSlot.fromNumber(0));
        assertThrows(IllegalArgumentException.class, () -> PeriodSlot.fromNumber(9));
    }
}
