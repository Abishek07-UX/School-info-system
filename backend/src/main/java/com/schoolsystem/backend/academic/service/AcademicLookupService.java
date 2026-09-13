package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.response.ClassSummaryDTO;
import com.schoolsystem.backend.academic.dto.response.StudentSummaryDTO;
import com.schoolsystem.backend.academic.dto.response.SubjectSummaryDTO;
import com.schoolsystem.backend.timetable.dto.response.CampusRoomDTO;
import com.schoolsystem.backend.user.dto.response.UserDTO;

import java.util.List;

public interface AcademicLookupService {

    List<ClassSummaryDTO> getAllClasses();

    List<SubjectSummaryDTO> getSubjectsForClass(Long classId);

    List<StudentSummaryDTO> getStudentsForClass(Long classId);

    List<SubjectSummaryDTO> getAllSubjects();

    List<UserDTO> getAllTeachers();

    List<CampusRoomDTO> getAllCampusRooms();
}
