package com.schoolsystem.backend.controller;

import com.schoolsystem.backend.model.Teacher;
import com.schoolsystem.backend.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    private final TeacherRepository teacherRepository;

    public TeacherController(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    // Add a new teacher
    @PostMapping
    public ResponseEntity<?> addTeacher(@RequestBody Teacher teacher) {

        if (teacherRepository.existsByEmail(teacher.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("A teacher with this email already exists.");
        }

        Teacher savedTeacher = teacherRepository.save(teacher);
        return ResponseEntity.ok(savedTeacher);
    }

    // View all teachers
    @GetMapping
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // View one teacher
    @GetMapping("/{id}")
    public ResponseEntity<Teacher> getTeacherById(@PathVariable Long id) {

        return teacherRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update teacher
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(
            @PathVariable Long id,
            @RequestBody Teacher teacherDetails) {

        return teacherRepository.findById(id)
                .map(teacher -> {

                    teacher.setFirstName(teacherDetails.getFirstName());
                    teacher.setLastName(teacherDetails.getLastName());
                    teacher.setEmail(teacherDetails.getEmail());
                    teacher.setPhoneNumber(teacherDetails.getPhoneNumber());
                    teacher.setQualification(teacherDetails.getQualification());
                    teacher.setEmploymentStatus(teacherDetails.getEmploymentStatus());
                    teacher.setSubject(teacherDetails.getSubject());
                    teacher.setAssignedClass(teacherDetails.getAssignedClass());
                    teacher.setTeachingHistory(teacherDetails.getTeachingHistory());

                    Teacher updatedTeacher = teacherRepository.save(teacher);
                    return ResponseEntity.ok(updatedTeacher);

                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Deactivate teacher
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateTeacher(@PathVariable Long id) {

        return teacherRepository.findById(id)
                .map(teacher -> {
                    teacher.setActive(false);
                    Teacher updatedTeacher = teacherRepository.save(teacher);
                    return ResponseEntity.ok(updatedTeacher);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}