package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.request.CreateExamWithTimetableRequest;
import com.schoolsystem.backend.academic.dto.request.ExamSlotItemRequest;
import com.schoolsystem.backend.academic.dto.response.ExamWithTimetableResponseDTO;
import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import com.schoolsystem.backend.academic.repository.ExamRepository;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.timetable.dto.response.ExamConflictCheckResponse;
import com.schoolsystem.backend.timetable.dto.response.ExamScheduleResponse;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @Mock
    private ExamScheduleRepository examScheduleRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExamConflictService conflictService;

    @InjectMocks
    private ExamServiceImpl examService;

    private SchoolClass class10A;
    private SchoolClass class10B;
    private SchoolClass class10C;
    private Subject math;
    private Subject science;
    private User teacher1;

    private void setId(Object entity, Long id) {
        try {
            Class<?> clazz = entity.getClass();
            Field field = null;
            while (clazz != null && field == null) {
                try {
                    field = clazz.getDeclaredField("id");
                } catch (NoSuchFieldException e) {
                    clazz = clazz.getSuperclass();
                }
            }
            if (field != null) {
                field.setAccessible(true);
                field.set(entity, id);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @BeforeEach
    void setUp() {
        teacher1 = new TeacherUser("clerk_t1", "teach1@school.lk", "John", "Silva",
                "0771112222", "Colombo", "198511223344", UserStatus.ACTIVE);
        setId(teacher1, 101L);

        class10A = new SchoolClass("10-A", 10, 40, teacher1);
        setId(class10A, 1L);

        class10B = new SchoolClass("10-B", 10, 40, teacher1);
        setId(class10B, 2L);

        class10C = new SchoolClass("10-C", 10, 40, teacher1);
        setId(class10C, 3L);

        math = new Subject("Mathematics", "MATH-10", 10);
        setId(math, 201L);

        science = new Subject("Science", "SCI-10", 10);
        setId(science, 202L);
    }

    @Test
    @DisplayName("Successfully schedules unified exam timetable for 3 classes in Grade 10 simultaneously")
    void testCreateExamWithTimetable_MultiClass_Success() {
        CreateExamWithTimetableRequest request = new CreateExamWithTimetableRequest();
        request.setName("First Term Examination");
        request.setAcademicYear(2026);
        request.setTerm(ExamTerm.TERM_1);
        request.setGradeLevel(10);
        request.setClassIds(List.of(1L, 2L, 3L)); // 10-A, 10-B, 10-C
        request.setStartDate(LocalDate.of(2026, 3, 23));
        request.setEndDate(LocalDate.of(2026, 3, 27));

        List<ExamSlotItemRequest> slots = new ArrayList<>();
        slots.add(new ExamSlotItemRequest(201L, LocalDate.of(2026, 3, 23), LocalTime.of(8, 30), LocalTime.of(11, 30), null, null, 100, "Math exam"));
        slots.add(new ExamSlotItemRequest(202L, LocalDate.of(2026, 3, 24), LocalTime.of(8, 30), LocalTime.of(11, 30), null, null, 100, "Science exam"));
        request.setSlots(slots);

        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(class10A));
        when(schoolClassRepository.findById(2L)).thenReturn(Optional.of(class10B));
        when(schoolClassRepository.findById(3L)).thenReturn(Optional.of(class10C));

        when(subjectRepository.findById(201L)).thenReturn(Optional.of(math));
        when(subjectRepository.findById(202L)).thenReturn(Optional.of(science));

        when(userRepository.findAll()).thenReturn(List.of(teacher1));

        when(examRepository.save(any(Exam.class))).thenAnswer(invocation -> {
            Exam e = invocation.getArgument(0);
            setId(e, 500L + (long) (Math.random() * 1000));
            return e;
        });

        when(conflictService.checkConflict(anyLong(), anyLong(), any(), any(), any(), any(), anyString(), any()))
                .thenReturn(ExamConflictCheckResponse.noConflict());

        when(examScheduleRepository.save(any(ExamSchedule.class))).thenAnswer(invocation -> {
            ExamSchedule es = invocation.getArgument(0);
            setId(es, 700L + (long) (Math.random() * 1000));
            return es;
        });

        when(conflictService.toResponseDTO(any(ExamSchedule.class))).thenAnswer(invocation -> {
            ExamSchedule es = invocation.getArgument(0);
            ExamScheduleResponse resp = new ExamScheduleResponse();
            resp.setId(es.getId());
            resp.setClassName(es.getSchoolClass().getName());
            resp.setRoom(es.getRoom());
            resp.setSubjectName(es.getSubject().getName());
            return resp;
        });

        ExamWithTimetableResponseDTO result = examService.createExamWithTimetable(request);

        assertNotNull(result);
        assertEquals(3, result.getTotalClasses(), "Should create exams for all 3 classes");
        assertEquals(6, result.getTotalSlots(), "Should create 6 total slots (3 classes x 2 subjects)");
        assertTrue(result.getMessage().contains("Successfully scheduled"));

        // Verify exams saved 3 times (once per class)
        verify(examRepository, times(3)).save(any(Exam.class));
        // Verify schedules saved 6 times (3 classes x 2 subjects)
        verify(examScheduleRepository, times(6)).save(any(ExamSchedule.class));
    }

    @Test
    @DisplayName("Fails if slot date falls outside exam start/end date range")
    void testCreateExamWithTimetable_DateOutOfRange_ThrowsException() {
        CreateExamWithTimetableRequest request = new CreateExamWithTimetableRequest();
        request.setName("First Term Examination");
        request.setAcademicYear(2026);
        request.setTerm(ExamTerm.TERM_1);
        request.setGradeLevel(10);
        request.setClassIds(List.of(1L));
        request.setStartDate(LocalDate.of(2026, 3, 23));
        request.setEndDate(LocalDate.of(2026, 3, 25));

        // Slot date is March 27, which is after March 25
        List<ExamSlotItemRequest> slots = List.of(
                new ExamSlotItemRequest(201L, LocalDate.of(2026, 3, 27), LocalTime.of(8, 30), LocalTime.of(11, 30), null, null, 100, null)
        );
        request.setSlots(slots);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            examService.createExamWithTimetable(request);
        });

        assertTrue(ex.getMessage().contains("must be within the exam date range"));
    }
}
