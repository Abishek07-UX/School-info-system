package com.schoolsystem.backend.timetable.service;

import com.schoolsystem.backend.timetable.dto.request.ExamScheduleRequest;
import com.schoolsystem.backend.timetable.dto.response.ExamScheduleResponse;

import java.util.List;

public interface ExamScheduleService {

    List<ExamScheduleResponse> getSchedulesForExam(Long examId);

    List<ExamScheduleResponse> getSchedulesForClass(Long classId, Long examId);

    List<ExamScheduleResponse> getInvigilatorDuties(Long teacherId);

    ExamScheduleResponse createExamSchedule(ExamScheduleRequest request);

    ExamScheduleResponse updateExamSchedule(Long scheduleId, ExamScheduleRequest request);

    void deleteExamSchedule(Long scheduleId);
}
