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
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.model.UserRole;
import com.schoolsystem.backend.user.repository.UserRepository;
import com.schoolsystem.backend.teacher.dto.request.TeacherUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeacherServiceImpl implements TeacherService {

    private final UserRepository userRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    public TeacherServiceImpl(
            UserRepository userRepository,
            TeacherSubjectRepository teacherSubjectRepository,
            SubjectRepository subjectRepository,
            SchoolClassRepository schoolClassRepository
    ) {
        this.userRepository = userRepository;
        this.teacherSubjectRepository = teacherSubjectRepository;
        this.subjectRepository = subjectRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    public void setJdbcTemplate(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private void enrichTeacherDetails(TeacherDTO dto) {
        if (dto == null || dto.getId() == null || jdbcTemplate == null) return;
        try {
            jdbcTemplate.query(
                "SELECT qualification, subject, assigned_class, teaching_history, availability, employment_status FROM teachers WHERE id = ?",
                rs -> {
                    dto.setQualification(rs.getString("qualification"));
                    dto.setSubjectSpecialization(rs.getString("subject"));
                    dto.setAssignedClass(rs.getString("assigned_class"));
                    dto.setTeachingHistory(rs.getString("teaching_history"));
                    dto.setAvailability(rs.getString("availability"));
                    if (rs.getString("employment_status") != null) {
                        dto.setEmploymentStatus(rs.getString("employment_status"));
                    }
                },
                dto.getId()
            );
        } catch (Exception e) {
            // fallback silently
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherDTO> getAllTeachers() {
        List<Long> assignedTeacherIds = teacherSubjectRepository.findAll().stream()
                .filter(ts -> ts.getTeacher() != null)
                .map(ts -> ts.getTeacher().getId())
                .distinct()
                .collect(Collectors.toList());

        List<User> teachers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.TEACHER 
                        || "TEACHER".equalsIgnoreCase(u.getRole().name())
                        || assignedTeacherIds.contains(u.getId()))
                .collect(Collectors.toList());

        return teachers.stream()
                .map(t -> {
                    List<TeacherSubject> ts = teacherSubjectRepository.findByTeacherId(t.getId());
                    TeacherDTO dto = new TeacherDTO(t, ts);
                    enrichTeacherDetails(dto);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TeacherDTO getTeacherById(Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TEACHER_NOT_FOUND", "Teacher not found with id: " + id));

        List<TeacherSubject> ts = teacherSubjectRepository.findByTeacherId(teacher.getId());
        TeacherDTO dto = new TeacherDTO(teacher, ts);
        enrichTeacherDetails(dto);
        return dto;
    }

    @Override
    @Transactional
    public TeacherDTO assignSubject(Long teacherId, AssignSubjectRequest request) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("TEACHER_NOT_FOUND", "Teacher not found with id: " + teacherId));

        if (teacher.getRole() != UserRole.TEACHER) {
            throw new IllegalArgumentException("User with id " + teacherId + " is not a teacher");
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("SUBJECT_NOT_FOUND", "Subject not found with id: " + request.getSubjectId()));

        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + request.getClassId()));

        Optional<TeacherSubject> existing = teacherSubjectRepository
                .findByTeacherIdAndSubjectIdAndSchoolClassId(teacherId, request.getSubjectId(), request.getClassId());

        if (existing.isEmpty()) {
            TeacherSubject ts = new TeacherSubject(teacher, subject, schoolClass);
            teacherSubjectRepository.save(ts);
        }

        List<TeacherSubject> tsList = teacherSubjectRepository.findByTeacherId(teacherId);
        TeacherDTO dto = new TeacherDTO(teacher, tsList);
        enrichTeacherDetails(dto);
        return dto;
    }

    @Override
    @Transactional
    public TeacherDTO updateTeacher(Long id, TeacherUpdateRequest request) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TEACHER_NOT_FOUND", "Teacher not found with id: " + id));

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            teacher.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            teacher.setAddress(request.getAddress().trim());
        }
        userRepository.save(teacher);

        if (jdbcTemplate != null) {
            try {
                jdbcTemplate.update("""
                    UPDATE teachers
                    SET phone_number = COALESCE(?, phone_number),
                        qualification = COALESCE(?, qualification),
                        subject = COALESCE(?, subject),
                        teaching_history = COALESCE(?, teaching_history),
                        availability = COALESCE(?, availability),
                        employment_status = COALESCE(?, employment_status)
                    WHERE id = ?
                """,
                    request.getPhoneNumber(),
                    request.getQualification(),
                    request.getSubjectSpecialization(),
                    request.getTeachingHistory(),
                    request.getAvailability(),
                    request.getEmploymentStatus(),
                    id
                );
            } catch (Exception e) {
                // Ignore fallback
            }
        }

        List<TeacherSubject> tsList = teacherSubjectRepository.findByTeacherId(id);
        TeacherDTO dto = new TeacherDTO(teacher, tsList);
        enrichTeacherDetails(dto);
        return dto;
    }

    @Override
    @Transactional
    public void removeSubjectAssignment(Long assignmentId) {
        if (!teacherSubjectRepository.existsById(assignmentId)) {
            throw new ResourceNotFoundException("ASSIGNMENT_NOT_FOUND", "Subject assignment not found with id: " + assignmentId);
        }
        teacherSubjectRepository.deleteById(assignmentId);
    }
}
