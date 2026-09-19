package com.schoolsystem.backend.timetable.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public class ExamScheduleResponse {

    private Long id;
    private Long examId;
    private String examName;
    private Integer academicYear;
    private String term;

    private Long classId;
    private String className;
    private Integer gradeLevel;
    private String building;
    private String defaultRoom;

    private Long subjectId;
    private String subjectName;
    private String subjectCode;
    private String customSubjectName;

    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room; // Venue (e.g. "Main Auditorium (G-AUD)", "Physics Lab", "Classroom E-101")

    private Long invigilatorId;
    private String invigilatorName;
    private String invigilatorEmail;

    private Long coInvigilatorId;
    private String coInvigilatorName;

    private Integer maxMarks;
    private String instructions;

    public ExamScheduleResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getExamId() {
        return examId;
    }

    public void setExamId(Long examId) {
        this.examId = examId;
    }

    public String getExamName() {
        return examName;
    }

    public void setExamName(String examName) {
        this.examName = examName;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getDefaultRoom() {
        return defaultRoom;
    }

    public void setDefaultRoom(String defaultRoom) {
        this.defaultRoom = defaultRoom;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getCustomSubjectName() {
        return customSubjectName;
    }

    public void setCustomSubjectName(String customSubjectName) {
        this.customSubjectName = customSubjectName;
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

    public String getInvigilatorName() {
        return invigilatorName;
    }

    public void setInvigilatorName(String invigilatorName) {
        this.invigilatorName = invigilatorName;
    }

    public String getInvigilatorEmail() {
        return invigilatorEmail;
    }

    public void setInvigilatorEmail(String invigilatorEmail) {
        this.invigilatorEmail = invigilatorEmail;
    }

    public Long getCoInvigilatorId() {
        return coInvigilatorId;
    }

    public void setCoInvigilatorId(Long coInvigilatorId) {
        this.coInvigilatorId = coInvigilatorId;
    }

    public String getCoInvigilatorName() {
        return coInvigilatorName;
    }

    public void setCoInvigilatorName(String coInvigilatorName) {
        this.coInvigilatorName = coInvigilatorName;
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
