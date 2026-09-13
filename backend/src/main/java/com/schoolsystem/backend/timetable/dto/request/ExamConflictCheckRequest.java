package com.schoolsystem.backend.timetable.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class ExamConflictCheckRequest {

    @NotNull(message = "Class ID is required")
    private Long classId;

    @NotNull(message = "Invigilator ID is required")
    private Long invigilatorId;

    private Long coInvigilatorId;

    @NotNull(message = "Exam date is required")
    private LocalDate examDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String room;

    private Long excludeScheduleId;

    public ExamConflictCheckRequest() {
    }

    public ExamConflictCheckRequest(Long classId, Long invigilatorId, Long coInvigilatorId,
                                    LocalDate examDate, LocalTime startTime, LocalTime endTime,
                                    String room, Long excludeScheduleId) {
        this.classId = classId;
        this.invigilatorId = invigilatorId;
        this.coInvigilatorId = coInvigilatorId;
        this.examDate = examDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
        this.excludeScheduleId = excludeScheduleId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getInvigilatorId() {
        return invigilatorId;
    }

    public void setInvigilatorId(Long invigilatorId) {
        this.invigilatorId = invigilatorId;
    }

    public Long getCoInvigilatorId() {
        return coInvigilatorId;
    }

    public void setCoInvigilatorId(Long coInvigilatorId) {
        this.coInvigilatorId = coInvigilatorId;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public Long getExcludeScheduleId() {
        return excludeScheduleId;
    }

    public void setExcludeScheduleId(Long excludeScheduleId) {
        this.excludeScheduleId = excludeScheduleId;
    }
}
