package com.schoolsystem.backend.teacher.service;

import com.schoolsystem.backend.teacher.dto.request.AssignSubjectRequest;
import com.schoolsystem.backend.teacher.dto.response.TeacherDTO;

import java.util.List;

public interface TeacherService {

    List<TeacherDTO> getAllTeachers();

    TeacherDTO getTeacherById(Long id);

    TeacherDTO assignSubject(Long teacherId, AssignSubjectRequest request);

    TeacherDTO updateTeacher(Long id, com.schoolsystem.backend.teacher.dto.request.TeacherUpdateRequest request);

    void removeSubjectAssignment(Long assignmentId);
}
