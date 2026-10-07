package com.schoolsystem.backend.student.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Section;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SectionRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.student.dto.request.CreateStudentRequest;
import com.schoolsystem.backend.student.dto.request.UpdateStudentRequest;
import com.schoolsystem.backend.student.dto.response.StudentResponseDTO;
import com.schoolsystem.backend.student.model.Student;
import com.schoolsystem.backend.student.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @InjectMocks
    private StudentServiceImpl studentService;

    private SchoolClass testClass;
    private Section testSection;
    private Student testStudent;

    @BeforeEach
    void setUp() {
        testClass = new SchoolClass("Grade 10-A", 10, 40, null);
        testSection = new Section("A", testClass);
        testStudent = new Student(
                "STU20260001",
                "Kasun",
                "Perera",
                LocalDate.now().minusYears(15),
                "MALE",
                "123 Main St, Colombo",
                "0771234567",
                "Sunil Perera",
                "0777654321",
                testClass,
                testSection,
                2026,
                "ACTIVE"
        );
    }

    @Test
    @DisplayName("Should successfully register a new student with generated admission number")
    void registerStudent_success() {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setFirstName("Kasun");
        request.setLastName("Perera");
        request.setDob(LocalDate.now().minusYears(15));
        request.setGender("MALE");
        request.setAdmissionYear(2026);
        request.setClassId(1L);
        request.setSectionId(1L);

        when(studentRepository.count()).thenReturn(0L);
        when(studentRepository.findByAdmissionNumber(anyString())).thenReturn(Optional.empty());
        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(testSection));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentResponseDTO result = studentService.registerStudent(request);

        assertNotNull(result);
        assertEquals("Kasun", result.getFirstName());
        assertEquals("Perera", result.getLastName());
        assertEquals("STU20260001", result.getAdmissionNumber());
        assertEquals("ACTIVE", result.getStatus());
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when student DOB is null")
    void registerStudent_fail_dobNull() {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setFirstName("Kasun");
        request.setLastName("Perera");
        request.setDob(null);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                studentService.registerStudent(request)
        );
        assertEquals("Date of birth is mandatory", ex.getMessage());
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when student is under 5 years old")
    void registerStudent_fail_underAge() {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setFirstName("Baby");
        request.setLastName("Student");
        request.setDob(LocalDate.now().minusYears(3));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                studentService.registerStudent(request)
        );
        assertTrue(ex.getMessage().contains("at least 5 years old"));
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when classId does not exist during registration")
    void registerStudent_fail_classNotFound() {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setFirstName("Kasun");
        request.setLastName("Perera");
        request.setDob(LocalDate.now().minusYears(12));
        request.setClassId(999L);

        when(schoolClassRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                studentService.registerStudent(request)
        );
    }

    @Test
    @DisplayName("Should update student biographical details and persist to database")
    void updateStudent_success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateStudentRequest request = new UpdateStudentRequest();
        request.setFirstName("Kasun Updated");
        request.setLastName("Perera");
        request.setDob(LocalDate.now().minusYears(16));
        request.setAddress("456 New Road, Kandy");
        request.setContactNumber("0719876543");
        request.setStatus("ACTIVE");

        StudentResponseDTO updated = studentService.updateStudent(1L, request);

        assertNotNull(updated);
        assertEquals("Kasun Updated", updated.getFirstName());
        assertEquals("456 New Road, Kandy", updated.getAddress());
        verify(studentRepository, times(1)).save(testStudent);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when update student DOB makes age under 5")
    void updateStudent_fail_underAge() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));

        UpdateStudentRequest request = new UpdateStudentRequest();
        request.setFirstName("Kasun");
        request.setLastName("Perera");
        request.setDob(LocalDate.now().minusYears(2)); // age 2

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                studentService.updateStudent(1L, request)
        );
        assertTrue(ex.getMessage().contains("at least 5 years old"));
    }

    @Test
    @DisplayName("Should get student profile by ID")
    void getStudentById_success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));

        StudentResponseDTO dto = studentService.getStudentById(1L);

        assertNotNull(dto);
        assertEquals("STU20260001", dto.getAdmissionNumber());
        assertEquals("Kasun Perera", dto.getFullName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when student ID not found")
    void getStudentById_notFound() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studentService.getStudentById(99L));
    }

    @Test
    @DisplayName("Should search students with filter parameters")
    void searchStudents_success() {
        when(studentRepository.searchStudents(eq("Kasun"), eq(10L), eq(2026), eq("ACTIVE")))
                .thenReturn(List.of(testStudent));

        List<StudentResponseDTO> results = studentService.searchStudents("Kasun", 10L, 2026, "ACTIVE");

        assertEquals(1, results.size());
        assertEquals("Kasun", results.get(0).getFirstName());
    }

    @Test
    @DisplayName("Should delete student")
    void deleteStudent_success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));

        studentService.deleteStudent(1L);

        verify(studentRepository, times(1)).delete(testStudent);
    }
}
