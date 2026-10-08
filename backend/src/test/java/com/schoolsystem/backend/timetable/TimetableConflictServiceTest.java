package com.schoolsystem.backend.timetable;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.timetable.dto.response.ConflictCheckResponse;
import com.schoolsystem.backend.timetable.model.DayOfWeek;
import com.schoolsystem.backend.timetable.model.TimetableSlot;
import com.schoolsystem.backend.timetable.repository.TimetableRepository;
import com.schoolsystem.backend.timetable.service.TimetableConflictService;
import com.schoolsystem.backend.user.model.TeacherUser;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TimetableConflictServiceTest {

    @Mock
    private TimetableRepository timetableRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @InjectMocks
    private TimetableConflictService conflictService;

    private User teacher1;
    private SchoolClass class10A;
    private SchoolClass class10B;
    private Subject math;

    @BeforeEach
    void setUp() {
        teacher1 = new TeacherUser("clerk_1", "teacher1@school.lk", "Kasun", "Perera", "0771234567", "Colombo", "199012345678", com.schoolsystem.backend.user.model.UserStatus.ACTIVE);
        class10A = new SchoolClass("Grade 10-A", 10, 45, teacher1);
        class10B = new SchoolClass("Grade 10-B", 10, 45, teacher1);
        math = new Subject("Mathematics", "MATH10", 10);
    }

    @Test
    @DisplayName("Should detect Teacher Collision when teacher is already booked on the same day and period")
    void testTeacherCollisionDetection() {
        TimetableSlot existingSlot = new TimetableSlot(class10A, math, teacher1, DayOfWeek.MONDAY, 1, 2026);

        when(timetableRepository.findByTeacherIdAndDayOfWeekAndPeriodNumberAndAcademicYear(1L, DayOfWeek.MONDAY, 1, 2026))
                .thenReturn(Optional.of(existingSlot));
        when(userRepository.findById(1L)).thenReturn(Optional.of(teacher1));

        ConflictCheckResponse response = conflictService.checkConflict(2L, 1L, DayOfWeek.MONDAY, 1, 2026, null);

        assertTrue(response.isHasConflict());
        assertEquals("TEACHER_CLASH", response.getConflictType());
        assertTrue(response.getMessage().contains("Teacher Collision"));
        assertTrue(response.getMessage().contains("Kasun Perera"));
        assertTrue(response.getMessage().contains("Grade 10-A"));
    }

    @Test
    @DisplayName("Should detect Class Collision when class already has a subject on the same day and period")
    void testClassCollisionDetection() {
        TimetableSlot existingSlot = new TimetableSlot(class10A, math, teacher1, DayOfWeek.TUESDAY, 3, 2026);

        when(timetableRepository.findByTeacherIdAndDayOfWeekAndPeriodNumberAndAcademicYear(2L, DayOfWeek.TUESDAY, 3, 2026))
                .thenReturn(Optional.empty());
        when(timetableRepository.findBySchoolClassIdAndDayOfWeekAndPeriodNumberAndAcademicYear(1L, DayOfWeek.TUESDAY, 3, 2026))
                .thenReturn(Optional.of(existingSlot));
        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(class10A));

        ConflictCheckResponse response = conflictService.checkConflict(1L, 2L, DayOfWeek.TUESDAY, 3, 2026, null);

        assertTrue(response.isHasConflict());
        assertEquals("CLASS_CLASH", response.getConflictType());
        assertTrue(response.getMessage().contains("Class Collision"));
        assertTrue(response.getMessage().contains("Grade 10-A"));
    }

    @Test
    @DisplayName("Should return NO conflict when slot is completely free")
    void testNoConflictWhenFree() {
        when(timetableRepository.findByTeacherIdAndDayOfWeekAndPeriodNumberAndAcademicYear(1L, DayOfWeek.WEDNESDAY, 4, 2026))
                .thenReturn(Optional.empty());
        when(timetableRepository.findBySchoolClassIdAndDayOfWeekAndPeriodNumberAndAcademicYear(1L, DayOfWeek.WEDNESDAY, 4, 2026))
                .thenReturn(Optional.empty());

        ConflictCheckResponse response = conflictService.checkConflict(1L, 1L, DayOfWeek.WEDNESDAY, 4, 2026, null);

        assertFalse(response.isHasConflict());
        assertEquals("NONE", response.getConflictType());
    }
}
