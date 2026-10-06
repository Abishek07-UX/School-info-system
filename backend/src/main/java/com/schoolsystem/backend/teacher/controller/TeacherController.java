package com.schoolsystem.backend.teacher.controller;

import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.teacher.dto.request.AssignSubjectRequest;
import com.schoolsystem.backend.teacher.dto.response.TeacherDTO;
import com.schoolsystem.backend.teacher.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public ApiResponse<List<TeacherDTO>> getAllTeachers() {
        List<TeacherDTO> teachers = teacherService.getAllTeachers();
        return ApiResponse.success(teachers, "Teachers retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<TeacherDTO> getTeacherById(@PathVariable Long id) {
        TeacherDTO teacher = teacherService.getTeacherById(id);
        return ApiResponse.success(teacher, "Teacher profile retrieved successfully");
    }

    @PostMapping("/{id}/subjects")
    public ApiResponse<TeacherDTO> assignSubject(
            @PathVariable Long id,
            @Valid @RequestBody AssignSubjectRequest request
    ) {
        TeacherDTO updated = teacherService.assignSubject(id, request);
        return ApiResponse.success(updated, "Subject assigned to teacher successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<TeacherDTO> updateTeacher(
            @PathVariable Long id,
            @RequestBody com.schoolsystem.backend.teacher.dto.request.TeacherUpdateRequest request
    ) {
        TeacherDTO updated = teacherService.updateTeacher(id, request);
        return ApiResponse.success(updated, "Teacher profile updated successfully");
    }

    @DeleteMapping("/subjects/{id}")
    public ApiResponse<Void> removeSubjectAssignment(@PathVariable Long id) {
        teacherService.removeSubjectAssignment(id);
        return ApiResponse.message("Subject assignment removed successfully");
    }
}
