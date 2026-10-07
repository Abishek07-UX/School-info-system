package com.schoolsystem.backend.student.service;

import com.schoolsystem.backend.student.dto.request.CreateStudentRequest;
import com.schoolsystem.backend.student.dto.request.UpdateStudentRequest;
import com.schoolsystem.backend.student.dto.response.StudentResponseDTO;

import java.util.List;

public interface StudentService {

    StudentResponseDTO registerStudent(CreateStudentRequest request);

    StudentResponseDTO updateStudent(Long id, UpdateStudentRequest request);

    StudentResponseDTO getStudentById(Long id);

    List<StudentResponseDTO> searchStudents(String query, Long classId, Integer admissionYear, String status);

    void deleteStudent(Long id);
}
