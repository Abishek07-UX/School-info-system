package com.schoolsystem.backend.teacher.service;

import com.schoolsystem.backend.teacher.model.Teacher;
import com.schoolsystem.backend.teacher.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    // 1. CREATE - Add Teacher
    public Teacher createTeacher(Teacher teacher) {

        if (teacherRepository.existsByEmail(teacher.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        teacher.setActive(true);

        return teacherRepository.save(teacher);
    }

    // 2. READ - View All Teachers
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // 3. UPDATE - Edit Teacher
    public Teacher updateTeacher(Long id, Teacher updatedTeacher) {

        Teacher existingTeacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        existingTeacher.setFirstName(updatedTeacher.getFirstName());
        existingTeacher.setLastName(updatedTeacher.getLastName());
        existingTeacher.setEmail(updatedTeacher.getEmail());
        existingTeacher.setPhoneNumber(updatedTeacher.getPhoneNumber());
        existingTeacher.setQualification(updatedTeacher.getQualification());
        existingTeacher.setEmploymentStatus(updatedTeacher.getEmploymentStatus());
        existingTeacher.setSubject(updatedTeacher.getSubject());
        existingTeacher.setAssignedClass(updatedTeacher.getAssignedClass());
        existingTeacher.setTeachingHistory(updatedTeacher.getTeachingHistory());
        existingTeacher.setActive(updatedTeacher.isActive());

        return teacherRepository.save(existingTeacher);
    }

    // 4. DELETE - Deactivate Teacher
    public void deactivateTeacher(Long id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        teacher.setActive(false);

        teacherRepository.save(teacher);
    }
}