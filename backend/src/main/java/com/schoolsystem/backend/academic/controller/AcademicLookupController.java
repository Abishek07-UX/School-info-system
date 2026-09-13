package com.schoolsystem.backend.academic.controller;

import com.schoolsystem.backend.academic.dto.response.ClassSummaryDTO;
import com.schoolsystem.backend.academic.dto.response.StudentSummaryDTO;
import com.schoolsystem.backend.academic.dto.response.SubjectSummaryDTO;
import com.schoolsystem.backend.academic.service.AcademicLookupService;
import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.timetable.dto.response.CampusRoomDTO;
import com.schoolsystem.backend.user.dto.response.UserDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic/lookup")
public class AcademicLookupController {

    private final AcademicLookupService academicLookupService;

    public AcademicLookupController(AcademicLookupService academicLookupService) {
        this.academicLookupService = academicLookupService;
    }

    @GetMapping("/classes")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER', 'FINANCE_STAFF')")
    public ApiResponse<List<ClassSummaryDTO>> getClasses() {
        List<ClassSummaryDTO> classes = academicLookupService.getAllClasses();
        return ApiResponse.success(classes, "Classes retrieved successfully");
    }

    @GetMapping("/classes/{classId}/subjects")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<SubjectSummaryDTO>> getSubjectsForClass(@PathVariable Long classId) {
        List<SubjectSummaryDTO> subjects = academicLookupService.getSubjectsForClass(classId);
        return ApiResponse.success(subjects, "Class subjects retrieved successfully");
    }

    @GetMapping("/classes/{classId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<StudentSummaryDTO>> getStudentsForClass(@PathVariable Long classId) {
        List<StudentSummaryDTO> students = academicLookupService.getStudentsForClass(classId);
        return ApiResponse.success(students, "Class students retrieved successfully");
    }

    @GetMapping("/subjects")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<SubjectSummaryDTO>> getAllSubjects() {
        List<SubjectSummaryDTO> subjects = academicLookupService.getAllSubjects();
        return ApiResponse.success(subjects, "All curriculum subjects retrieved successfully");
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<UserDTO>> getAllTeachers() {
        List<UserDTO> teachers = academicLookupService.getAllTeachers();
        return ApiResponse.success(teachers, "Faculty teachers retrieved successfully");
    }

    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<CampusRoomDTO>> getAllCampusRooms() {
        List<CampusRoomDTO> rooms = academicLookupService.getAllCampusRooms();
        return ApiResponse.success(rooms, "Campus buildings and rooms retrieved successfully");
    }

    @GetMapping("/grades/{gradeLevel}/subjects")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<SubjectSummaryDTO>> getSubjectsForGrade(@PathVariable Integer gradeLevel) {
        List<SubjectSummaryDTO> subjects = academicLookupService.getSubjectsForGrade(gradeLevel);
        return ApiResponse.success(subjects, "Curriculum subjects for grade " + gradeLevel + " retrieved successfully");
    }

    @GetMapping("/grades/{gradeLevel}/classes")
    @PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'TEACHER')")
    public ApiResponse<List<ClassSummaryDTO>> getClassesForGrade(@PathVariable Integer gradeLevel) {
        List<ClassSummaryDTO> classes = academicLookupService.getClassesForGrade(gradeLevel);
        return ApiResponse.success(classes, "Active classes for grade " + gradeLevel + " retrieved successfully");
    }
}
