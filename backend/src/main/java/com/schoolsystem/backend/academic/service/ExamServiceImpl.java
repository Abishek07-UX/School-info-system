package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.request.CreateExamRequest;
import com.schoolsystem.backend.academic.dto.request.UpdateExamRequest;
import com.schoolsystem.backend.academic.dto.response.ExamResponseDTO;
import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import com.schoolsystem.backend.academic.repository.ExamRepository;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final SchoolClassRepository schoolClassRepository;

    public ExamServiceImpl(ExamRepository examRepository, SchoolClassRepository schoolClassRepository) {
        this.examRepository = examRepository;
        this.schoolClassRepository = schoolClassRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDTO> getAllExams(Integer academicYear, ExamTerm term, Long classId, ExamStatus status) {
        List<Exam> exams = examRepository.searchExams(academicYear, term, classId, status);
        return exams.stream()
                .map(ExamResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamResponseDTO getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id, "EXAM_NOT_FOUND"));
        return ExamResponseDTO.fromEntity(exam);
    }

    @Override
    public ExamResponseDTO createExam(CreateExamRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId(), "CLASS_NOT_FOUND"));

        Exam exam = new Exam(
                request.getName(),
                request.getAcademicYear(),
                request.getTerm(),
                schoolClass,
                request.getStartDate(),
                request.getEndDate(),
                request.getStatus(),
                request.getDescription()
        );

        Exam saved = examRepository.save(exam);
        return ExamResponseDTO.fromEntity(saved);
    }

    @Override
    public ExamResponseDTO updateExam(Long id, UpdateExamRequest request) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id, "EXAM_NOT_FOUND"));

        if (request.getName() != null) exam.setName(request.getName().trim());
        if (request.getAcademicYear() != null) exam.setAcademicYear(request.getAcademicYear());
        if (request.getTerm() != null) exam.setTerm(request.getTerm());
        if (request.getClassId() != null) {
            SchoolClass sc = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.getClassId(), "CLASS_NOT_FOUND"));
            exam.setSchoolClass(sc);
        }
        if (request.getStartDate() != null) exam.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) exam.setEndDate(request.getEndDate());
        if (request.getStatus() != null) exam.setStatus(request.getStatus());
        if (request.getDescription() != null) exam.setDescription(request.getDescription().trim());

        if (exam.getStartDate() != null && exam.getEndDate() != null && exam.getStartDate().isAfter(exam.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Exam updated = examRepository.save(exam);
        return ExamResponseDTO.fromEntity(updated);
    }

    @Override
    public void deleteExam(Long id) {
        if (!examRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exam not found with id: " + id, "EXAM_NOT_FOUND");
        }
        examRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDTO> getExamsForClass(Long classId, Integer academicYear) {
        List<Exam> exams;
        if (academicYear != null) {
            exams = examRepository.findBySchoolClassIdAndAcademicYearOrderByTermAsc(classId, academicYear);
        } else {
            exams = examRepository.findBySchoolClassIdOrderByStartDateDesc(classId);
        }
        return exams.stream()
                .map(ExamResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
