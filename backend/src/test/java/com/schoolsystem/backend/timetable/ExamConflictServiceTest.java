package com.schoolsystem.backend.timetable;

import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.teacher.repository.TeacherSubjectRepository;
import com.schoolsystem.backend.timetable.dto.response.ExamConflictCheckResponse;
import com.schoolsystem.backend.timetable.model.ExamSchedule;
import com.schoolsystem.backend.timetable.repository.ExamScheduleRepository;
import com.schoolsystem.backend.timetable.service.ExamConflictService;
import com.schoolsystem.backend.user.model.TeacherUser;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.model.UserStatus;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamConflictServiceTest {

    @Mock
    private ExamScheduleRepository examScheduleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @Mock
    private TeacherSubjectRepository teacherSubjectRepository;

    @InjectMocks
    private ExamConflictService examConflictService;

    private User invigilator1;
    private SchoolClass class10A;
    private SchoolClass class10B;
    private Subject science;
    private Subject math;
    private Exam termExam;

    @BeforeEach
    void setUp() throws Exception {
        invigilator1 = new TeacherUser("clerk_t1", "invig1@school.lk", "Sunil", "Bandara", "0711122334", "Kandy", "198511223344", UserStatus.ACTIVE);
        setEntityId(invigilator1, 10L);

        class10A = new SchoolClass("Grade 10-A", 10, 45, invigilator1);
        setEntityId(class10A, 1L);

        class10B = new SchoolClass("Grade 10-B", 10, 45, invigilator1);
        setEntityId(class10B, 2L);

        science = new Subject("Science", "SCI10", 10);
        setEntityId(science, 101L);

        math = new Subject("Mathematics", "MATH10", 10);
        setEntityId(math, 102L);

        termExam = new Exam("Term 1 Exam", 2026, ExamTerm.TERM_1, class10A, LocalDate.of(2026, 3, 15), LocalDate.of(2026, 3, 25), ExamStatus.UPCOMING, "Term evaluation");
        setEntityId(termExam, 50L);
    }

    private void setEntityId(Object entity, Long id) throws Exception {
        Class<?> current = entity.getClass();
        Field idField = null;
        while (current != null) {
            try {
                idField = current.getDeclaredField("id");
                break;
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        if (idField != null) {
            idField.setAccessible(true);
            idField.set(entity, id);
        }
    }

    @Test
    @DisplayName("Should detect Class Exam Overlap when same class has another exam at the same date and time")
    void testClassExamOverlapDetection() throws Exception {
        LocalDate date = LocalDate.of(2026, 3, 20);
        ExamSchedule existing = new ExamSchedule(termExam, class10A, math, date, LocalTime.of(8, 30), LocalTime.of(11, 30), "Main Hall", invigilator1, null, 100, "");
        setEntityId(existing, 1001L);

        when(examScheduleRepository.findByExamDate(date)).thenReturn(List.of(existing));
        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(class10A));

        ExamConflictCheckResponse res = examConflictService.checkConflict(
                1L, 99L, null, date, LocalTime.of(9, 0), LocalTime.of(11, 0), "Lab", null
        );

        assertTrue(res.isHasConflict());
        assertEquals("CLASS_OVERLAP", res.getConflictType());
        assertTrue(res.getMessage().contains("Class Exam Clash"));
    }

    @Test
    @DisplayName("Should detect Invigilator Duty Clash when teacher is supervising another exam simultaneously")
    void testInvigilatorClashDetection() throws Exception {
        LocalDate date = LocalDate.of(2026, 3, 20);
        ExamSchedule existing = new ExamSchedule(termExam, class10A, math, date, LocalTime.of(8, 30), LocalTime.of(11, 30), "Hall A", invigilator1, null, 100, "");
        setEntityId(existing, 1001L);

        when(examScheduleRepository.findByExamDate(date)).thenReturn(List.of(existing));
        when(userRepository.findById(10L)).thenReturn(Optional.of(invigilator1));

        ExamConflictCheckResponse res = examConflictService.checkConflict(
                2L, 10L, null, date, LocalTime.of(9, 0), LocalTime.of(12, 0), "Hall B", null
        );

        assertTrue(res.isHasConflict());
        assertEquals("INVIGILATOR_CLASH", res.getConflictType());
        assertTrue(res.getMessage().contains("Invigilator Duty Clash"));
        assertTrue(res.getMessage().contains("Sunil Bandara"));
    }
}
