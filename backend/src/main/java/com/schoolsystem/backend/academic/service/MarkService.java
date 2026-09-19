package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.request.BatchMarkEntryRequest;
import com.schoolsystem.backend.academic.dto.request.EnterMarkRequest;
import com.schoolsystem.backend.academic.dto.response.BatchMarkResponseDTO;
import com.schoolsystem.backend.academic.dto.response.MarkResponseDTO;

import java.util.List;

public interface MarkService {

    MarkResponseDTO enterSingleMark(EnterMarkRequest request, Long recordedByUserId);

    BatchMarkResponseDTO enterBatchMarks(BatchMarkEntryRequest request, Long recordedByUserId);

    List<MarkResponseDTO> getMarksForExamAndSubject(Long examId, Long subjectId);

    List<MarkResponseDTO> getMarksForExamAndStudent(Long examId, Long studentId);

    List<MarkResponseDTO> getMarksForExam(Long examId);

    void deleteMark(Long id);
}
