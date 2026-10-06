package com.schoolsystem.backend.administration.service;

import com.schoolsystem.backend.administration.dto.request.CreateClassRequest;
import com.schoolsystem.backend.administration.dto.request.CreateSectionRequest;
import com.schoolsystem.backend.administration.dto.request.CreateSubjectRequest;
import com.schoolsystem.backend.administration.dto.response.ClassDTO;
import com.schoolsystem.backend.administration.dto.response.SectionDTO;
import com.schoolsystem.backend.administration.dto.response.SubjectDTO;

import java.util.List;

public interface AdministrationService {

    List<ClassDTO> getAllClasses();

    ClassDTO getClassById(Long id);

    ClassDTO createClass(CreateClassRequest request);

    SectionDTO createSection(CreateSectionRequest request);

    List<SectionDTO> getAllSections();

    SectionDTO getSectionById(Long id);

    ClassDTO assignClassToSection(Long classId, Long sectionId);

    List<SubjectDTO> getAllSubjects();

    SubjectDTO createSubject(CreateSubjectRequest request);
}

