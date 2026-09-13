package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.request.CreateExamRequest;
import com.schoolsystem.backend.academic.dto.request.UpdateExamRequest;
import com.schoolsystem.backend.academic.dto.response.ExamResponseDTO;
import com.schoolsystem.backend.academic.dto.request.CreateExamWithTimetableRequest;
import com.schoolsystem.backend.academic.dto.response.ExamWithTimetableResponseDTO;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;

import java.util.List;

public interface ExamService {

    List<ExamResponseDTO> getAllExams(Integer academicYear, ExamTerm term, Long classId, ExamStatus status);

    ExamResponseDTO getExamById(Long id);

    ExamResponseDTO createExam(CreateExamRequest request);

    ExamWithTimetableResponseDTO createExamWithTimetable(CreateExamWithTimetableRequest request);

    ExamResponseDTO updateExam(Long id, UpdateExamRequest request);

    void deleteExam(Long id);

    List<ExamResponseDTO> getExamsForClass(Long classId, Integer academicYear);
}

