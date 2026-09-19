package com.schoolsystem.backend.timetable.service;

import com.schoolsystem.backend.timetable.dto.request.TimetableSlotRequest;
import com.schoolsystem.backend.timetable.dto.response.ClassTimetableResponse;
import com.schoolsystem.backend.timetable.dto.response.TeacherScheduleResponse;
import com.schoolsystem.backend.timetable.dto.response.TimetableAuditResponse;
import com.schoolsystem.backend.timetable.dto.response.TimetableSlotResponse;

import java.util.List;

public interface TimetableService {

    ClassTimetableResponse getClassTimetable(Long classId, Integer academicYear);

    TeacherScheduleResponse getTeacherSchedule(Long teacherId, Integer academicYear);

    TimetableSlotResponse createSlot(TimetableSlotRequest request);

    TimetableSlotResponse updateSlot(Long slotId, TimetableSlotRequest request);

    void deleteSlot(Long slotId);

    void clearClassTimetable(Long classId, Integer academicYear);

    List<TimetableSlotResponse> autoGenerateTimetable(Long classId, Integer academicYear);

    TimetableAuditResponse auditSchoolTimetable(Integer academicYear);
}
