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
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final JdbcTemplate jdbcTemplate;

    public StudentServiceImpl(
            StudentRepository studentRepository,
            SchoolClassRepository schoolClassRepository,
            SectionRepository sectionRepository,
            JdbcTemplate jdbcTemplate
    ) {
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.sectionRepository = sectionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public StudentResponseDTO registerStudent(CreateStudentRequest request) {
        if (request.getDob() == null) {
            throw new IllegalArgumentException("Date of birth is mandatory");
        }
        int age = Period.between(request.getDob(), LocalDate.now()).getYears();
        if (age < 5) {
            throw new IllegalArgumentException("Student must be at least 5 years old for admission");
        }

        int year = request.getAdmissionYear() != null ? request.getAdmissionYear() : LocalDate.now().getYear();
        long count = studentRepository.count();
        int seq = (int) count + 1;
        String generatedAdmission = String.format("STU%d%04d", year, seq);
        while (studentRepository.findByAdmissionNumber(generatedAdmission).isPresent()) {
            seq++;
            generatedAdmission = String.format("STU%d%04d", year, seq);
        }

        SchoolClass schoolClass = null;
        if (request.getClassId() != null) {
            schoolClass = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + request.getClassId()));
        }

        Section section = null;
        if (request.getSectionId() != null) {
            section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("SECTION_NOT_FOUND", "Section not found with id: " + request.getSectionId()));
        } else if (schoolClass != null) {
            List<Section> sections = sectionRepository.findBySchoolClassIdOrderByNameAsc(schoolClass.getId());
            if (!sections.isEmpty()) {
                section = sections.get(0);
            }
        }

        String studentContact = validateAndCleanPhone(request.getContactNumber(), "Student contact number");
        String guardianContact = validateAndCleanPhone(request.getGuardianContact(), "Guardian contact number");

        Student student = new Student(
                generatedAdmission,
                request.getFirstName().trim(),
                request.getLastName().trim(),
                request.getDob(),
                request.getGender(),
                request.getAddress(),
                studentContact,
                request.getGuardianName(),
                guardianContact,
                schoolClass,
                section,
                year,
                "ACTIVE"
        );

        Student saved = studentRepository.save(student);
        return new StudentResponseDTO(saved);
    }

    @Override
    @Transactional
    public StudentResponseDTO updateStudent(Long id, UpdateStudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("STUDENT_NOT_FOUND", "Student not found with id: " + id));

        student.setFirstName(request.getFirstName().trim());
        student.setLastName(request.getLastName().trim());
        if (request.getDob() != null) {
            int age = Period.between(request.getDob(), LocalDate.now()).getYears();
            if (age < 5) {
                throw new IllegalArgumentException("Student must be at least 5 years old");
            }
            student.setDob(request.getDob());
        }
        if (request.getGender() != null) student.setGender(request.getGender());
        if (request.getAddress() != null) student.setAddress(request.getAddress());
        if (request.getContactNumber() != null) {
            student.setContactNumber(validateAndCleanPhone(request.getContactNumber(), "Student contact number"));
        }
        if (request.getGuardianName() != null) student.setGuardianName(request.getGuardianName());
        if (request.getGuardianContact() != null) {
            student.setGuardianContact(validateAndCleanPhone(request.getGuardianContact(), "Guardian contact number"));
        }
        if (request.getStatus() != null) student.setStatus(request.getStatus());

        if (request.getClassId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + request.getClassId()));
            student.setSchoolClass(schoolClass);
            if (request.getSectionId() == null) {
                List<Section> sections = sectionRepository.findBySchoolClassIdOrderByNameAsc(schoolClass.getId());
                if (!sections.isEmpty()) {
                    student.setSection(sections.get(0));
                }
            }
        }

        if (request.getSectionId() != null) {
            Section section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("SECTION_NOT_FOUND", "Section not found with id: " + request.getSectionId()));
            student.setSection(section);
        }

        Student saved = studentRepository.save(student);
        return new StudentResponseDTO(saved);
    }

    private String validateAndCleanPhone(String rawPhone, String fieldLabel) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return null;
        }
        String clean = rawPhone.trim().replaceAll("[\\s\\-()]", "");
        if (!clean.matches("^[0-9]{10}$")) {
            throw new IllegalArgumentException(fieldLabel + " must contain exactly 10 digits (e.g. 0771234567)");
        }
        return clean;
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("STUDENT_NOT_FOUND", "Student not found with id: " + id));
        return new StudentResponseDTO(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDTO> searchStudents(String query, Long classId, Integer admissionYear, String status) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status.trim() : null;

        return studentRepository.searchStudents(cleanQuery, classId, admissionYear, cleanStatus)
                .stream()
                .map(StudentResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("STUDENT_NOT_FOUND", "Student not found with id: " + id));

        // Cleanly remove any related records to prevent foreign key constraint violations
        jdbcTemplate.update("DELETE FROM marks WHERE student_id = ?", id);
        jdbcTemplate.update("DELETE FROM payments WHERE student_id = ?", id);
        jdbcTemplate.update("DELETE FROM student_attendance WHERE student_id = ?", id);

        studentRepository.delete(student);
    }
}
