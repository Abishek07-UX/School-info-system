package com.schoolsystem.backend.administration.controller;

import com.schoolsystem.backend.administration.dto.request.CreateClassRequest;
import com.schoolsystem.backend.administration.dto.request.CreateSectionRequest;
import com.schoolsystem.backend.administration.dto.request.CreateSubjectRequest;
import com.schoolsystem.backend.administration.dto.response.ClassDTO;
import com.schoolsystem.backend.administration.dto.response.SectionDTO;
import com.schoolsystem.backend.administration.dto.response.SubjectDTO;
import com.schoolsystem.backend.administration.service.AdministrationService;
import com.schoolsystem.backend.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AdministrationController {

    private final AdministrationService administrationService;

    public AdministrationController(AdministrationService administrationService) {
        this.administrationService = administrationService;
    }

    @GetMapping("/classes")
    public ApiResponse<List<ClassDTO>> getAllClasses() {
        List<ClassDTO> classes = administrationService.getAllClasses();
        return ApiResponse.success(classes, "School classes retrieved successfully");
    }

    @GetMapping("/classes/{id}")
    public ApiResponse<ClassDTO> getClassById(@PathVariable Long id) {
        ClassDTO classDTO = administrationService.getClassById(id);
        return ApiResponse.success(classDTO, "Class details retrieved successfully");
    }

    @PostMapping("/classes")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ClassDTO> createClass(@Valid @RequestBody CreateClassRequest request) {
        ClassDTO created = administrationService.createClass(request);
        return ApiResponse.success(created, "Class created successfully");
    }

    @GetMapping("/sections")
    public ApiResponse<List<SectionDTO>> getAllSections() {
        List<SectionDTO> sections = administrationService.getAllSections();
        return ApiResponse.success(sections, "Sections retrieved successfully");
    }

    @GetMapping("/sections/{id}")
    public ApiResponse<SectionDTO> getSectionById(@PathVariable Long id) {
        SectionDTO section = administrationService.getSectionById(id);
        return ApiResponse.success(section, "Section details retrieved successfully");
    }

    @PostMapping("/sections")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SectionDTO> createSection(@Valid @RequestBody CreateSectionRequest request) {
        SectionDTO created = administrationService.createSection(request);
        return ApiResponse.success(created, "Section created successfully");
    }

    @PutMapping("/classes/{classId}/section/{sectionId}")
    public ApiResponse<ClassDTO> assignClassToSection(@PathVariable Long classId, @PathVariable Long sectionId) {
        ClassDTO updated = administrationService.assignClassToSection(classId, sectionId);
        return ApiResponse.success(updated, "Class assigned to section successfully");
    }

    @GetMapping("/subjects")
    public ApiResponse<List<SubjectDTO>> getAllSubjects() {
        List<SubjectDTO> subjects = administrationService.getAllSubjects();
        return ApiResponse.success(subjects, "Curriculum subjects retrieved successfully");
    }

    @PostMapping("/subjects")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SubjectDTO> createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        SubjectDTO created = administrationService.createSubject(request);
        return ApiResponse.success(created, "Subject created successfully");
    }
}
