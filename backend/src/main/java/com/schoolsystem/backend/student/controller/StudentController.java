package com.schoolsystem.backend.student.controller;

import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.student.dto.request.CreateStudentRequest;
import com.schoolsystem.backend.student.dto.request.UpdateStudentRequest;
import com.schoolsystem.backend.student.dto.response.StudentResponseDTO;
import com.schoolsystem.backend.student.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StudentResponseDTO> registerStudent(@Valid @RequestBody CreateStudentRequest request) {
        StudentResponseDTO created = studentService.registerStudent(request);
        return ApiResponse.success(created, "Student registered successfully with ID: " + created.getAdmissionNumber());
    }

    @GetMapping
    public ApiResponse<List<StudentResponseDTO>> searchStudents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Integer admissionYear,
            @RequestParam(required = false) String status
    ) {
        List<StudentResponseDTO> students = studentService.searchStudents(query, classId, admissionYear, status);
        return ApiResponse.success(students, "Students retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<StudentResponseDTO> getStudentById(@PathVariable Long id) {
        StudentResponseDTO student = studentService.getStudentById(id);
        return ApiResponse.success(student, "Student profile retrieved successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<StudentResponseDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentRequest request
    ) {
        StudentResponseDTO updated = studentService.updateStudent(id, request);
        return ApiResponse.success(updated, "Student profile updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ApiResponse.message("Student removed successfully");
    }
}
