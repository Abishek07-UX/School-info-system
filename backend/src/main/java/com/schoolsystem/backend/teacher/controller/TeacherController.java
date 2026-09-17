package com.schoolsystem.backend.teacher.controller;

import com.schoolsystem.backend.teacher.model.Teacher;
import com.schoolsystem.backend.teacher.service.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "http://localhost:5173")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    // 1. CREATE - Add Teacher
    @PostMapping
    public ResponseEntity<Teacher> createTeacher(
            @RequestBody Teacher teacher) {

        return ResponseEntity.ok(
                teacherService.createTeacher(teacher)
        );
    }

    // 2. READ - View All Teachers
    @GetMapping
    public ResponseEntity<List<Teacher>> getAllTeachers() {

        return ResponseEntity.ok(
                teacherService.getAllTeachers()
        );
    }

    // 3. UPDATE - Edit Teacher
    @PutMapping("/{id}")
    public ResponseEntity<Teacher> updateTeacher(
            @PathVariable Long id,
            @RequestBody Teacher teacher) {

        return ResponseEntity.ok(
                teacherService.updateTeacher(id, teacher)
        );
    }

    // 4. DELETE - Deactivate Teacher
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateTeacher(
            @PathVariable Long id) {

        teacherService.deactivateTeacher(id);

        return ResponseEntity.noContent().build();
    }
}