package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.response.ClassSummaryDTO;
import com.schoolsystem.backend.academic.dto.response.StudentSummaryDTO;
import com.schoolsystem.backend.academic.dto.response.SubjectSummaryDTO;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.student.repository.StudentRepository;
import com.schoolsystem.backend.timetable.dto.response.CampusRoomDTO;
import com.schoolsystem.backend.timetable.model.CampusFacility;
import com.schoolsystem.backend.user.dto.response.UserDTO;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.model.UserRole;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AcademicLookupServiceImpl implements AcademicLookupService {

    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public AcademicLookupServiceImpl(SchoolClassRepository schoolClassRepository,
                                    SubjectRepository subjectRepository,
                                    StudentRepository studentRepository,
                                    UserRepository userRepository) {
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<ClassSummaryDTO> getAllClasses() {
        return schoolClassRepository.findAllByOrderByGradeLevelAscNameAsc()
                .stream()
                .map(ClassSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubjectSummaryDTO> getSubjectsForClass(Long classId) {
        SchoolClass sc = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId, "CLASS_NOT_FOUND"));

        return subjectRepository.findByGradeLevelOrderByNameAsc(sc.getGradeLevel())
                .stream()
                .map(SubjectSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentSummaryDTO> getStudentsForClass(Long classId) {
        return studentRepository.findBySchoolClassIdOrderByLastNameAscFirstNameAsc(classId)
                .stream()
                .map(StudentSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubjectSummaryDTO> getAllSubjects() {
        return subjectRepository.findAllByOrderByGradeLevelAscNameAsc()
                .stream()
                .map(SubjectSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllTeachers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(u -> u.getRole() == UserRole.TEACHER || u.getRole() == UserRole.PRINCIPAL || u.getRole() == UserRole.ADMIN)
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<CampusRoomDTO> getAllCampusRooms() {
        return CampusFacility.getAllCampusRooms().stream()
                .map(r -> new CampusRoomDTO(r.code(), r.name(), r.building(), r.floor(), r.type(), r.capacity()))
                .collect(Collectors.toList());
    }
}
