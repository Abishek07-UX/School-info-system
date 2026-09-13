package com.schoolsystem.backend.timetable.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public class ExamScheduleRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Class ID is required")
    private Long classId;

    @NotNull(message = "Subject ID is required")
    private Long subjectId;

    @NotNull(message = "Exam date is required")
    private LocalDate examDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String room;

    @NotNull(message = "Chief Invigilator ID is required")
    private Long invigilatorId;

    private Long coInvigilatorId;

    private Integer maxMarks = 100;

    private String instructions;

    public ExamScheduleRequest() {
    }

    public ExamScheduleRequest(Long examId, Long classId, Long subjectId, LocalDate examDate,
                               LocalTime startTime, LocalTime endTime, String room,
                               Long invigilatorId, Long coInvigilatorId, Integer maxMarks, String instructions) {
        this.examId = examId;
        this.classId = classId;
        this.subjectId = subjectId;
        this.examDate = examDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
        this.invigilatorId = invigilatorId;
        this.coInvigilatorId = coInvigilatorId;
        this.maxMarks = maxMarks;
        this.instructions = instructions;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
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

    public Integer getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Integer maxMarks) {
        this.maxMarks = maxMarks;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}
