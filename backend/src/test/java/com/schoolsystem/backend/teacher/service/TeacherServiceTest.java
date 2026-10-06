package com.schoolsystem.backend.teacher.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.teacher.dto.request.AssignSubjectRequest;
import com.schoolsystem.backend.teacher.dto.response.TeacherDTO;
import com.schoolsystem.backend.teacher.model.TeacherSubject;
import com.schoolsystem.backend.teacher.repository.TeacherSubjectRepository;
import com.schoolsystem.backend.user.model.AdminUser;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeacherSubjectRepository teacherSubjectRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @InjectMocks
    private TeacherServiceImpl teacherService;

    private TeacherUser teacher;
    private SchoolClass schoolClass;
    private Subject subject;

    @BeforeEach
    void setUp() throws Exception {
        teacher = new TeacherUser(
                "clerk_teacher_1",
                "kamal.silva@school.lk",
                "Kamal",
                "Silva",
                "0771234567",
                "Colombo",
                "851234567V",
                UserStatus.ACTIVE
        );
        setId(teacher, 10L);

        schoolClass = new SchoolClass("Grade 10-A", 10, 40, teacher);
        setId(schoolClass, 1L);

        subject = new Subject("Mathematics", "MATH10", 10);
        setId(subject, 5L);
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
    @DisplayName("Should retrieve all teachers with their assigned subjects")
    void getAllTeachers_success() {
        when(userRepository.findAll()).thenReturn(List.of(teacher));
        when(teacherSubjectRepository.findByTeacherId(10L)).thenReturn(List.of());

        List<TeacherDTO> list = teacherService.getAllTeachers();

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Kamal Silva", list.get(0).getName());
    }

    @Test
    @DisplayName("Should get teacher profile by ID")
    void getTeacherById_success() {
        TeacherSubject ts = new TeacherSubject(teacher, subject, schoolClass);
        when(userRepository.findById(10L)).thenReturn(Optional.of(teacher));
        when(teacherSubjectRepository.findByTeacherId(10L)).thenReturn(List.of(ts));

        TeacherDTO dto = teacherService.getTeacherById(10L);

        assertNotNull(dto);
        assertEquals(10L, dto.getId());
        assertEquals(1, dto.getAssignments().size());
        assertEquals("Mathematics", dto.getAssignments().get(0).getSubjectName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when teacher ID not found")
    void getTeacherById_notFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> teacherService.getTeacherById(99L));
    }

    @Test
    @DisplayName("Should assign subject to teacher for a specific class")
    void assignSubject_success() {
        AssignSubjectRequest request = new AssignSubjectRequest();
        request.setSubjectId(5L);
        request.setClassId(1L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(teacher));
        when(subjectRepository.findById(5L)).thenReturn(Optional.of(subject));
        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(schoolClass));
        when(teacherSubjectRepository.findByTeacherIdAndSubjectIdAndSchoolClassId(10L, 5L, 1L))
                .thenReturn(Optional.empty());

        TeacherSubject savedTs = new TeacherSubject(teacher, subject, schoolClass);
        when(teacherSubjectRepository.save(any(TeacherSubject.class))).thenReturn(savedTs);
        when(teacherSubjectRepository.findByTeacherId(10L)).thenReturn(List.of(savedTs));

        TeacherDTO result = teacherService.assignSubject(10L, request);

        assertNotNull(result);
        assertEquals(1, result.getAssignments().size());
        verify(teacherSubjectRepository, times(1)).save(any(TeacherSubject.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when attempting to assign subject to a non-teacher user")
    void assignSubject_fail_notTeacher() throws Exception {
        AdminUser admin = new AdminUser("clerk_admin", "admin@school.lk", "Super", "Admin", null, null, null, UserStatus.ACTIVE);
        setId(admin, 100L);

        AssignSubjectRequest request = new AssignSubjectRequest();
        request.setSubjectId(5L);
        request.setClassId(1L);

        when(userRepository.findById(100L)).thenReturn(Optional.of(admin));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                teacherService.assignSubject(100L, request)
        );
        assertTrue(ex.getMessage().contains("not a teacher"));
        verify(teacherSubjectRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should be idempotent when subject is already assigned to the teacher")
    void assignSubject_alreadyAssigned() {
        AssignSubjectRequest request = new AssignSubjectRequest();
        request.setSubjectId(5L);
        request.setClassId(1L);

        TeacherSubject existing = new TeacherSubject(teacher, subject, schoolClass);

        when(userRepository.findById(10L)).thenReturn(Optional.of(teacher));
        when(subjectRepository.findById(5L)).thenReturn(Optional.of(subject));
        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(schoolClass));
        when(teacherSubjectRepository.findByTeacherIdAndSubjectIdAndSchoolClassId(10L, 5L, 1L))
                .thenReturn(Optional.of(existing));
        when(teacherSubjectRepository.findByTeacherId(10L)).thenReturn(List.of(existing));

        TeacherDTO result = teacherService.assignSubject(10L, request);

        assertNotNull(result);
        verify(teacherSubjectRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should remove subject assignment by ID")
    void removeSubjectAssignment_success() {
        when(teacherSubjectRepository.existsById(20L)).thenReturn(true);

        teacherService.removeSubjectAssignment(20L);

        verify(teacherSubjectRepository, times(1)).deleteById(20L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when assignment ID to remove is not found")
    void removeSubjectAssignment_notFound() {
        when(teacherSubjectRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () ->
                teacherService.removeSubjectAssignment(999L)
        );
    }

    @Test
    @DisplayName("Should update teacher contact and information successfully")
    void updateTeacher_success() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(teacher));
        when(userRepository.save(any(User.class))).thenReturn(teacher);
        when(teacherSubjectRepository.findByTeacherId(10L)).thenReturn(List.of());

        com.schoolsystem.backend.teacher.dto.request.TeacherUpdateRequest req = new com.schoolsystem.backend.teacher.dto.request.TeacherUpdateRequest();
        req.setPhoneNumber("0779998877");
        req.setAddress("45 Galle Road, Colombo");
        req.setQualification("M.Sc. Mathematics");
        req.setSubjectSpecialization("Mathematics");
        req.setTeachingHistory("10 years experience");
        req.setAvailability("Full-time");
        req.setEmploymentStatus("PERMANENT");

        TeacherDTO result = teacherService.updateTeacher(10L, req);

        assertNotNull(result);
        assertEquals("0779998877", teacher.getPhoneNumber());
        assertEquals("45 Galle Road, Colombo", teacher.getAddress());
        verify(userRepository, times(1)).save(teacher);
    }
}
