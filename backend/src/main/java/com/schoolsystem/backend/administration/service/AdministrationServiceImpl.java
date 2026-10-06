package com.schoolsystem.backend.administration.service;

import com.schoolsystem.backend.administration.dto.request.CreateClassRequest;
import com.schoolsystem.backend.administration.dto.request.CreateSectionRequest;
import com.schoolsystem.backend.administration.dto.request.CreateSubjectRequest;
import com.schoolsystem.backend.administration.dto.response.ClassDTO;
import com.schoolsystem.backend.administration.dto.response.SectionDTO;
import com.schoolsystem.backend.administration.dto.response.SubjectDTO;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Section;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SectionRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.student.repository.StudentRepository;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdministrationServiceImpl implements AdministrationService {

    private final SchoolClassRepository schoolClassRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public AdministrationServiceImpl(
            SchoolClassRepository schoolClassRepository,
            SectionRepository sectionRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository
    ) {
        this(schoolClassRepository, sectionRepository, subjectRepository, userRepository, null);
    }

    @Autowired
    public AdministrationServiceImpl(
            SchoolClassRepository schoolClassRepository,
            SectionRepository sectionRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository,
            @Autowired(required = false) StudentRepository studentRepository
    ) {
        this.schoolClassRepository = schoolClassRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<ClassDTO> getAllClasses() {
        return schoolClassRepository.findAllByOrderByGradeLevelAscNameAsc()
                .stream()
                .map(sc -> {
                    List<Section> sections = sectionRepository.findBySchoolClassId(sc.getId());
                    int studentCount = (studentRepository != null) ? (int) studentRepository.countBySchoolClassId(sc.getId()) : 0;
                    return new ClassDTO(sc, sections, studentCount);
                })
                .collect(Collectors.toList());
    }

    @Override
    public ClassDTO getClassById(Long id) {
        SchoolClass sc = schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + id));
        List<Section> sections = sectionRepository.findBySchoolClassId(sc.getId());
        int studentCount = (studentRepository != null) ? (int) studentRepository.countBySchoolClassId(sc.getId()) : 0;
        return new ClassDTO(sc, sections, studentCount);
    }

    @Override
    @Transactional
    public ClassDTO createClass(CreateClassRequest request) {
        if (request.getCapacity() != null && request.getCapacity() <= 0) {
            throw new IllegalArgumentException("Class capacity must be greater than zero");
        }

        User teacher = null;
        if (request.getClassTeacherId() != null) {
            teacher = userRepository.findById(request.getClassTeacherId()).orElse(null);
        }

        Section section = null;
        if (request.getSectionId() != null) {
            section = sectionRepository.findById(request.getSectionId()).orElse(null);
        } else if (request.getGradeLevel() != null) {
            // Find or create default Grade section
            section = sectionRepository.findByGradeLevelOrderByNameAsc(request.getGradeLevel())
                    .stream()
                    .findFirst()
                    .orElseGet(() -> sectionRepository.findByNameIgnoreCase("Grade " + request.getGradeLevel())
                            .orElse(null));
        }

        SchoolClass sc = new SchoolClass(
                request.getName().trim(),
                request.getGradeLevel(),
                request.getCapacity() != null ? request.getCapacity() : 45,
                teacher,
                section
        );

        SchoolClass saved = schoolClassRepository.save(sc);
        return new ClassDTO(saved, List.of(), 0);
    }

    @Override
    public List<SectionDTO> getAllSections() {
        List<Section> sections = sectionRepository.findAllByOrderByGradeLevelAscNameAsc();
        if (sections.isEmpty()) {
            sections = sectionRepository.findAll();
        }

        return sections.stream()
                .map(this::mapSectionWithClasses)
                .collect(Collectors.toList());
    }

    @Override
    public SectionDTO getSectionById(Long id) {
        Section s = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SECTION_NOT_FOUND", "Section not found with id: " + id));
        return mapSectionWithClasses(s);
    }

    @Override
    @Transactional
    public SectionDTO createSection(CreateSectionRequest request) {
        SchoolClass sc = null;
        Integer grade = request.getGradeLevel();

        if (request.getClassId() != null) {
            sc = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + request.getClassId()));
            if (grade == null) {
                grade = sc.getGradeLevel();
            }
        }

        Section s;
        if (sc != null) {
            s = new Section(request.getName().trim(), sc);
            s.setGradeLevel(grade);
        } else {
            s = new Section(request.getName().trim(), grade);
        }

        Section saved = sectionRepository.save(s);

        // Auto-link classes of same grade if they don't have a section
        if (grade != null) {
            List<SchoolClass> unlinked = schoolClassRepository.findByGradeLevelOrderByNameAsc(grade);
            for (SchoolClass c : unlinked) {
                if (c.getSection() == null) {
                    c.setSection(saved);
                    schoolClassRepository.save(c);
                }
            }
        }

        return mapSectionWithClasses(saved);
    }

    @Override
    @Transactional
    public ClassDTO assignClassToSection(Long classId, Long sectionId) {
        SchoolClass sc = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + classId));
        Section sec = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("SECTION_NOT_FOUND", "Section not found with id: " + sectionId));

        sc.setSection(sec);
        SchoolClass saved = schoolClassRepository.save(sc);
        int studentCount = (studentRepository != null) ? (int) studentRepository.countBySchoolClassId(saved.getId()) : 0;
        return new ClassDTO(saved, List.of(), studentCount);
    }

    @Override
    public List<SubjectDTO> getAllSubjects() {
        return subjectRepository.findAllByOrderByGradeLevelAscNameAsc()
                .stream()
                .map(SubjectDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SubjectDTO createSubject(CreateSubjectRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        if (subjectRepository.findByCode(cleanCode).isPresent()) {
            throw new IllegalArgumentException("Subject with code " + cleanCode + " already exists");
        }

        Subject subject = new Subject(
                request.getName().trim(),
                cleanCode,
                request.getGradeLevel()
        );
        Subject saved = subjectRepository.save(subject);
        return new SubjectDTO(saved);
    }

    private SectionDTO mapSectionWithClasses(Section sec) {
        List<SchoolClass> classes = schoolClassRepository.findBySectionIdOrderByNameAsc(sec.getId());
        List<SectionDTO.ClassSummaryDTO> summaries = new ArrayList<>();

        for (SchoolClass c : classes) {
            int studentCount = (studentRepository != null) ? (int) studentRepository.countBySchoolClassId(c.getId()) : 0;
            summaries.add(new SectionDTO.ClassSummaryDTO(c, studentCount));
        }

        // Backwards compatibility with old single schoolClass field
        if (sec.getSchoolClass() != null && classes.stream().noneMatch(c -> c.getId().equals(sec.getSchoolClass().getId()))) {
            int studentCount = (studentRepository != null) ? (int) studentRepository.countBySchoolClassId(sec.getSchoolClass().getId()) : 0;
            summaries.add(new SectionDTO.ClassSummaryDTO(sec.getSchoolClass(), studentCount));
        }

        return new SectionDTO(sec, summaries);
    }
}

