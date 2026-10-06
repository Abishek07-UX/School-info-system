package com.schoolsystem.backend.administration.service;

import com.schoolsystem.backend.administration.dto.request.CreateClassRequest;
import com.schoolsystem.backend.administration.dto.request.CreateSectionRequest;
import com.schoolsystem.backend.administration.dto.request.CreateSubjectRequest;
import com.schoolsystem.backend.administration.dto.response.ClassDTO;
import com.schoolsystem.backend.administration.dto.response.SectionDTO;
import com.schoolsystem.backend.administration.dto.response.SubjectDTO;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Section;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SectionRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdministrationServiceTest {

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdministrationServiceImpl administrationService;

    private SchoolClass testClass;
    private TeacherUser teacher;

    @BeforeEach
    void setUp() throws Exception {
        teacher = new TeacherUser("clerk_t1", "teacher@school.lk", "Kamal", "Silva", "0771234567", "Colombo", "851234567V", UserStatus.ACTIVE);
        setId(teacher, 20L);

        testClass = new SchoolClass("Grade 10-A", 10, 40, teacher);
        setId(testClass, 1L);
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
    @DisplayName("Should create school class with assigned class teacher")
    void createClass_success() {
        CreateClassRequest request = new CreateClassRequest();
        request.setName("Grade 10-A");
        request.setGradeLevel(10);
        request.setCapacity(40);
        request.setClassTeacherId(20L);

        when(userRepository.findById(20L)).thenReturn(Optional.of(teacher));
        when(schoolClassRepository.save(any(SchoolClass.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ClassDTO created = administrationService.createClass(request);

        assertNotNull(created);
        assertEquals("Grade 10-A", created.getName());
        assertEquals(10, created.getGradeLevel());
        assertEquals(40, created.getCapacity());
        verify(schoolClassRepository, times(1)).save(any(SchoolClass.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when class capacity is zero or negative")
    void createClass_fail_capacityInvalid() {
        CreateClassRequest request = new CreateClassRequest();
        request.setName("Grade 10-A");
        request.setGradeLevel(10);
        request.setCapacity(0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                administrationService.createClass(request)
        );
        assertTrue(ex.getMessage().contains("greater than zero"));
        verify(schoolClassRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should create section under a school class")
    void createSection_success() {
        CreateSectionRequest request = new CreateSectionRequest();
        request.setClassId(1L);
        request.setName("A");

        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(sectionRepository.save(any(Section.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SectionDTO created = administrationService.createSection(request);

        assertNotNull(created);
        assertEquals("A", created.getName());
        assertEquals(1L, created.getClassId());
        verify(sectionRepository, times(1)).save(any(Section.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when class for section does not exist")
    void createSection_fail_classNotFound() {
        CreateSectionRequest request = new CreateSectionRequest();
        request.setClassId(99L);
        request.setName("B");

        when(schoolClassRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                administrationService.createSection(request)
        );
    }

    @Test
    @DisplayName("Should create curriculum subject with uppercase code")
    void createSubject_success() {
        CreateSubjectRequest request = new CreateSubjectRequest();
        request.setName("Science");
        request.setCode("sci10");
        request.setGradeLevel(10);

        when(subjectRepository.findByCode("SCI10")).thenReturn(Optional.empty());
        when(subjectRepository.save(any(Subject.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubjectDTO created = administrationService.createSubject(request);

        assertNotNull(created);
        assertEquals("Science", created.getName());
        assertEquals("SCI10", created.getCode());
        verify(subjectRepository, times(1)).save(any(Subject.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when subject code already exists")
    void createSubject_fail_duplicateCode() {
        CreateSubjectRequest request = new CreateSubjectRequest();
        request.setName("Science");
        request.setCode("SCI10");
        request.setGradeLevel(10);

        Subject existing = new Subject("Science", "SCI10", 10);
        when(subjectRepository.findByCode("SCI10")).thenReturn(Optional.of(existing));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                administrationService.createSubject(request)
        );
        assertTrue(ex.getMessage().contains("already exists"));
        verify(subjectRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should retrieve all classes with their sections")
    void getAllClasses_success() {
        Section sectionA = new Section("A", testClass);
        when(schoolClassRepository.findAllByOrderByGradeLevelAscNameAsc()).thenReturn(List.of(testClass));
        when(sectionRepository.findBySchoolClassId(1L)).thenReturn(List.of(sectionA));

        List<ClassDTO> list = administrationService.getAllClasses();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(1, list.get(0).getSections().size());
        assertEquals("A", list.get(0).getSections().get(0).getName());
    }
}
