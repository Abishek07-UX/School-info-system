package com.schoolsystem.backend.attendance.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.attendance.dto.request.RecordStudentAttendanceRequest;
import com.schoolsystem.backend.attendance.dto.request.RecordTeacherAttendanceRequest;
import com.schoolsystem.backend.attendance.dto.response.AttendanceReportDTO;
import com.schoolsystem.backend.attendance.dto.response.StudentAttendanceDTO;
import com.schoolsystem.backend.attendance.dto.response.TeacherAttendanceDTO;
import com.schoolsystem.backend.attendance.model.StudentAttendance;
import com.schoolsystem.backend.attendance.model.TeacherAttendance;
import com.schoolsystem.backend.attendance.repository.StudentAttendanceRepository;
import com.schoolsystem.backend.attendance.repository.TeacherAttendanceRepository;
import com.schoolsystem.backend.student.model.Student;
import com.schoolsystem.backend.student.repository.StudentRepository;
import com.schoolsystem.backend.user.model.TeacherUser;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private StudentAttendanceRepository studentAttendanceRepository;

    @Mock
    private TeacherAttendanceRepository teacherAttendanceRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private SchoolClass testClass;
    private Student student1;
    private Student student2;
    private TeacherUser teacher;

    @BeforeEach
    void setUp() throws Exception {
        testClass = new SchoolClass("Grade 10-A", 10, 40, null);
        setId(testClass, 1L);

        student1 = new Student("STU20260001", "Amal", "Silva", LocalDate.now().minusYears(15), "MALE", "Colombo", "0771111111", "Sunil", "0772222222", testClass, null, 2026, "ACTIVE");
        setId(student1, 101L);

        student2 = new Student("STU20260002", "Bimal", "Fernando", LocalDate.now().minusYears(15), "MALE", "Gampaha", "0773333333", "Nimal", "0774444444", testClass, null, 2026, "ACTIVE");
        setId(student2, 102L);

        teacher = new TeacherUser("clerk_t1", "kamal@school.lk", "Kamal", "Silva", "0771234567", "Colombo", "851234567V", UserStatus.ACTIVE);
        setId(teacher, 201L);
    }

    private void setId(Object entity, Long id) throws Exception {
        Field idField;
        try {
            idField = entity.getClass().getDeclaredField("id");
        } catch (NoSuchFieldException e) {
            idField = entity.getClass().getSuperclass().getDeclaredField("id");
        }
        idField.setAccessible(true);
        idField.set(entity, id);
    }

    @Test
    @DisplayName("Should record student attendance for a class on a given date")
    void recordStudentAttendance_newRecord() {
        RecordStudentAttendanceRequest request = new RecordStudentAttendanceRequest();
        request.setClassId(1L);
        request.setDate(LocalDate.now());

        RecordStudentAttendanceRequest.StudentAttendanceItem item1 = new RecordStudentAttendanceRequest.StudentAttendanceItem();
        item1.setStudentId(101L);
        item1.setStatus("PRESENT");
        item1.setRemarks("On time");

        RecordStudentAttendanceRequest.StudentAttendanceItem item2 = new RecordStudentAttendanceRequest.StudentAttendanceItem();
        item2.setStudentId(102L);
        item2.setStatus("ABSENT");
        item2.setRemarks("Medical reason");

        request.setRecords(List.of(item1, item2));

        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(studentRepository.findById(101L)).thenReturn(Optional.of(student1));
        when(studentRepository.findById(102L)).thenReturn(Optional.of(student2));
        when(studentAttendanceRepository.findByStudentIdAndDate(anyLong(), any(LocalDate.class))).thenReturn(Optional.empty());
        when(studentAttendanceRepository.save(any(StudentAttendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<StudentAttendanceDTO> saved = attendanceService.recordStudentAttendance(request, null);

        assertNotNull(saved);
        assertEquals(2, saved.size());
        assertEquals("PRESENT", saved.get(0).getStatus());
        assertEquals("ABSENT", saved.get(1).getStatus());
        verify(studentAttendanceRepository, times(2)).save(any(StudentAttendance.class));
    }

    @Test
    @DisplayName("Should update existing attendance record when re-recording on same date (upsert)")
    void recordStudentAttendance_updateExisting() {
        RecordStudentAttendanceRequest request = new RecordStudentAttendanceRequest();
        request.setClassId(1L);
        request.setDate(LocalDate.now());

        RecordStudentAttendanceRequest.StudentAttendanceItem item = new RecordStudentAttendanceRequest.StudentAttendanceItem();
        item.setStudentId(101L);
        item.setStatus("LATE");
        item.setRemarks("Arrived at 8:30 AM");
        request.setRecords(List.of(item));

        StudentAttendance existingRecord = new StudentAttendance(student1, testClass, LocalDate.now(), "ABSENT", "Initial absence", null);

        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(studentRepository.findById(101L)).thenReturn(Optional.of(student1));
        when(studentAttendanceRepository.findByStudentIdAndDate(101L, LocalDate.now())).thenReturn(Optional.of(existingRecord));
        when(studentAttendanceRepository.save(any(StudentAttendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<StudentAttendanceDTO> saved = attendanceService.recordStudentAttendance(request, null);

        assertNotNull(saved);
        assertEquals(1, saved.size());
        assertEquals("LATE", saved.get(0).getStatus());
        assertEquals("Arrived at 8:30 AM", saved.get(0).getRemarks());
        verify(studentAttendanceRepository, times(1)).save(existingRecord);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when student status is invalid")
    void recordStudentAttendance_fail_invalidStatus() {
        RecordStudentAttendanceRequest request = new RecordStudentAttendanceRequest();
        request.setClassId(1L);
        request.setDate(LocalDate.now());

        RecordStudentAttendanceRequest.StudentAttendanceItem item = new RecordStudentAttendanceRequest.StudentAttendanceItem();
        item.setStudentId(101L);
        item.setStatus("UNKNOWN_STATUS");
        request.setRecords(List.of(item));

        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(testClass));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                attendanceService.recordStudentAttendance(request, null)
        );
        assertTrue(ex.getMessage().contains("Invalid attendance status"));
        verify(studentAttendanceRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should record teacher attendance successfully")
    void recordTeacherAttendance_newRecord() {
        RecordTeacherAttendanceRequest request = new RecordTeacherAttendanceRequest();
        request.setTeacherId(201L);
        request.setDate(LocalDate.now());
        request.setStatus("PRESENT");
        request.setCheckInTime("07:30");
        request.setCheckOutTime("13:30");

        when(userRepository.findById(201L)).thenReturn(Optional.of(teacher));
        when(teacherAttendanceRepository.findByTeacherIdAndDate(201L, LocalDate.now())).thenReturn(Optional.empty());
        when(teacherAttendanceRepository.save(any(TeacherAttendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TeacherAttendanceDTO dto = attendanceService.recordTeacherAttendance(request, null);

        assertNotNull(dto);
        assertEquals("PRESENT", dto.getStatus());
        assertEquals("07:30", dto.getCheckInTime());
        verify(teacherAttendanceRepository, times(1)).save(any(TeacherAttendance.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when teacher status is invalid")
    void recordTeacherAttendance_fail_invalidStatus() {
        RecordTeacherAttendanceRequest request = new RecordTeacherAttendanceRequest();
        request.setTeacherId(201L);
        request.setDate(LocalDate.now());
        request.setStatus("INVALID_STATUS");

        when(userRepository.findById(201L)).thenReturn(Optional.of(teacher));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                attendanceService.recordTeacherAttendance(request, null)
        );
        assertTrue(ex.getMessage().contains("Invalid teacher attendance status"));
    }

    @Test
    @DisplayName("Should generate attendance report with daily compliance rates")
    void getAttendanceReport_success() {
        LocalDate date = LocalDate.now();
        when(studentRepository.count()).thenReturn(100L);
        when(studentAttendanceRepository.countByDateAndStatus(date, "PRESENT")).thenReturn(90L);
        when(studentAttendanceRepository.countByDateAndStatus(date, "ABSENT")).thenReturn(8L);
        when(studentAttendanceRepository.countByDateAndStatus(date, "LATE")).thenReturn(2L);

        List<com.schoolsystem.backend.user.model.User> teachersList = java.util.Collections.nCopies(10, teacher);
        when(userRepository.findAll()).thenReturn(teachersList);
        when(teacherAttendanceRepository.countByDateAndStatus(date, "PRESENT")).thenReturn(9L);

        AttendanceReportDTO report = attendanceService.getAttendanceReport(date);

        assertNotNull(report);
        assertEquals(100L, report.getTotalStudents());
        assertEquals(90L, report.getPresentStudents());
        assertEquals(8L, report.getAbsentStudents());
        assertEquals(90.0, report.getStudentAttendancePercentage());
        assertEquals(10L, report.getTotalTeachers());
        assertEquals(9L, report.getPresentTeachers());
        assertEquals(90.0, report.getTeacherAttendancePercentage());
    }
}
