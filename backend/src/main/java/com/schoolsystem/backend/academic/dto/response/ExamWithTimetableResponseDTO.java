package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.timetable.dto.response.ExamScheduleResponse;
import java.util.ArrayList;
import java.util.List;

public class ExamWithTimetableResponseDTO {

    private List<ExamResponseDTO> exams = new ArrayList<>();
    private List<ExamScheduleResponse> schedules = new ArrayList<>();
    private int totalClasses;
    private int totalSlots;
    private String message;

    public ExamWithTimetableResponseDTO() {
    }

    public ExamWithTimetableResponseDTO(List<ExamResponseDTO> exams, List<ExamScheduleResponse> schedules, String message) {
        this.exams = exams != null ? exams : new ArrayList<>();
        this.schedules = schedules != null ? schedules : new ArrayList<>();
        this.totalClasses = this.exams.size();
        this.totalSlots = this.schedules.size();
        this.message = message;
    }

    public List<ExamResponseDTO> getExams() {
        return exams;
    }

    public void setExams(List<ExamResponseDTO> exams) {
        this.exams = exams;
        this.totalClasses = exams != null ? exams.size() : 0;
    }

    public List<ExamScheduleResponse> getSchedules() {
        return schedules;
    }

    public void setSchedules(List<ExamScheduleResponse> schedules) {
        this.schedules = schedules;
        this.totalSlots = schedules != null ? schedules.size() : 0;
    }

    public int getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }

    public int getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(int totalSlots) {
        this.totalSlots = totalSlots;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
