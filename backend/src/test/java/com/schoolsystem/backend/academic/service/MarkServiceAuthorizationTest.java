package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.request.BatchMarkEntryRequest;
import com.schoolsystem.backend.academic.dto.request.EnterMarkRequest;
import com.schoolsystem.backend.academic.dto.request.MarkItemDTO;
import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import com.schoolsystem.backend.academic.model.Mark;
import com.schoolsystem.backend.academic.repository.ExamRepository;
import com.schoolsystem.backend.academic.repository.MarkRepository;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.student.model.Student;
import com.schoolsystem.backend.student.repository.StudentRepository;
import com.schoolsystem.backend.user.model.AdminUser;
import com.schoolsystem.backend.user.model.TeacherUser;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.model.UserStatus;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarkServiceAuthorizationTest {
    @Mock MarkRepository markRepository;
    @Mock ExamRepository examRepository;
    @Mock StudentRepository studentRepository;
    @Mock SubjectRepository subjectRepository;
    @Mock UserRepository userRepository;
    @Mock GradingService gradingService;
    @InjectMocks MarkServiceImpl markService;

    private User assignedTeacher;
    private User otherTeacher;
    private User admin;
    private Student assignedStudent;
    private Student otherStudent;
    private Exam schoolWideExam;
    private Subject subject;

    @BeforeEach
    void setUp() {
        assignedTeacher = new TeacherUser("assigned", "assigned@example.com", "Assigned", "Teacher", null, null, null, UserStatus.ACTIVE);
        otherTeacher = new TeacherUser("other", "other@example.com", "Other", "Teacher", null, null, null, UserStatus.ACTIVE);
        admin = new AdminUser("admin", "admin@example.com", "School", "Admin", null, null, null, UserStatus.ACTIVE);
        setId(assignedTeacher, 10L);
        setId(otherTeacher, 20L);
        setId(admin, 30L);

        SchoolClass assignedClass = new SchoolClass("10-A", 10, 40, assignedTeacher);
        SchoolClass otherClass = new SchoolClass("10-B", 10, 40, otherTeacher);
        setId(assignedClass, 100L);
        setId(otherClass, 200L);
        assignedStudent = student(1000L, assignedClass);
        otherStudent = student(2000L, otherClass);

        schoolWideExam = new Exam("Term 1", 2026, ExamTerm.TERM_1, null,
                LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 5), ExamStatus.UPCOMING, null);
        setId(schoolWideExam, 1L);
        subject = new Subject("Mathematics", "MATH10", 10);
        setId(subject, 2L);
    }

    @Test
    void assignedTeacherCanEnterMarksForTheirStudent() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(assignedTeacher));
        when(examRepository.findById(1L)).thenReturn(Optional.of(schoolWideExam));
        when(studentRepository.findById(1000L)).thenReturn(Optional.of(assignedStudent));
        when(subjectRepository.findById(2L)).thenReturn(Optional.of(subject));
        when(markRepository.findByExamIdAndStudentIdAndSubjectId(1L, 1000L, 2L)).thenReturn(Optional.empty());
        when(markRepository.save(any(Mark.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = markService.enterSingleMark(new EnterMarkRequest(1L, 1000L, 2L, 80.0, "Good"), 10L);

        assertEquals(1000L, result.getStudentId());
        assertEquals(80.0, result.getScore());
        assertEquals(10L, result.getRecordedById());
        verify(markRepository).save(any(Mark.class));
    }

    @Test
    void teacherCannotEditAnotherClass() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(assignedTeacher));
        when(examRepository.findById(1L)).thenReturn(Optional.of(schoolWideExam));
        when(studentRepository.findById(2000L)).thenReturn(Optional.of(otherStudent));

        assertThrows(AccessDeniedException.class, () ->
                markService.enterSingleMark(new EnterMarkRequest(1L, 2000L, 2L, 80.0, null), 10L));
        verify(markRepository, never()).save(any());
    }

    @Test
    void mixedBatchIsRejectedBeforeAnyMarkIsSaved() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(assignedTeacher));
        when(examRepository.findById(1L)).thenReturn(Optional.of(schoolWideExam));
        when(subjectRepository.findById(2L)).thenReturn(Optional.of(subject));
        when(studentRepository.findAllById(List.of(1000L, 2000L)))
                .thenReturn(List.of(assignedStudent, otherStudent));

        var batch = new BatchMarkEntryRequest(1L, 2L, List.of(
                new MarkItemDTO(1000L, 75.0, null),
                new MarkItemDTO(2000L, 75.0, null)));

        assertThrows(AccessDeniedException.class, () -> markService.enterBatchMarks(batch, 10L));
        verify(markRepository, never()).save(any());
    }

    @Test
    void assignedTeacherCanEnterBatchMarksForTheirClass() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(assignedTeacher));
        when(examRepository.findById(1L)).thenReturn(Optional.of(schoolWideExam));
        when(subjectRepository.findById(2L)).thenReturn(Optional.of(subject));
        when(studentRepository.findAllById(List.of(1000L))).thenReturn(List.of(assignedStudent));
        when(markRepository.findByExamIdAndStudentIdAndSubjectId(1L, 1000L, 2L)).thenReturn(Optional.empty());
        when(markRepository.save(any(Mark.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = markService.enterBatchMarks(new BatchMarkEntryRequest(1L, 2L,
                List.of(new MarkItemDTO(1000L, 75.0, null))), 10L);

        assertEquals(1, result.getSavedCount());
        verify(markRepository).save(any(Mark.class));
    }

    @Test
    void classExamCannotBeUsedForStudentInDifferentClass() {
        schoolWideExam.setSchoolClass(otherStudent.getSchoolClass());
        when(userRepository.findById(10L)).thenReturn(Optional.of(assignedTeacher));
        when(examRepository.findById(1L)).thenReturn(Optional.of(schoolWideExam));
        when(studentRepository.findById(1000L)).thenReturn(Optional.of(assignedStudent));

        assertThrows(IllegalArgumentException.class, () ->
                markService.enterSingleMark(new EnterMarkRequest(1L, 1000L, 2L, 80.0, null), 10L));
        verify(markRepository, never()).save(any());
    }

    @Test
    void administratorCanEditAnotherClass() {
        when(userRepository.findById(30L)).thenReturn(Optional.of(admin));
        when(examRepository.findById(1L)).thenReturn(Optional.of(schoolWideExam));
        when(studentRepository.findById(2000L)).thenReturn(Optional.of(otherStudent));
        when(subjectRepository.findById(2L)).thenReturn(Optional.of(subject));
        when(markRepository.findByExamIdAndStudentIdAndSubjectId(1L, 2000L, 2L)).thenReturn(Optional.empty());
        when(markRepository.save(any(Mark.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals(2000L, markService.enterSingleMark(
                new EnterMarkRequest(1L, 2000L, 2L, 80.0, null), 30L).getStudentId());
    }

    private static Student student(Long id, SchoolClass schoolClass) {
        Student student = new Student("ADM-" + id, "Student", "Name", null,
                null, null, null, null, null, schoolClass, null, 2026, "ACTIVE");
        setId(student, id);
        return student;
    }

    private static void setId(Object entity, Long id) {
        Class<?> type = entity.getClass();
        while (type != null) {
            try {
                Field field = type.getDeclaredField("id");
                field.setAccessible(true);
                field.set(entity, id);
                return;
            } catch (NoSuchFieldException ignored) {
                type = type.getSuperclass();
            } catch (IllegalAccessException error) {
                throw new AssertionError(error);
            }
        }
        throw new AssertionError("Entity has no ID field");
    }
}
