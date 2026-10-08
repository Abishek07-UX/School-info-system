package com.schoolsystem.backend.timetable.dto.response;

import java.util.List;
import java.util.Map;

public class ClassTimetableResponse {

    private Long classId;
    private String className;
    private Integer gradeLevel;
    private String building;
    private String roomCode;
    private String classTeacherName;
    private Integer academicYear;

    private int totalWeeklySlots = 40; // 5 days x 8 periods
    private int assignedSlotsCount;
    private int unassignedSlotsCount;

    // Structure: Day (e.g. MONDAY) -> Period (1..8) -> TimetableSlotResponse
    private Map<String, Map<Integer, TimetableSlotResponse>> weeklyGrid;

    // Flat list of all slots
    private List<TimetableSlotResponse> slots;

    public ClassTimetableResponse() {
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

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    public String getClassTeacherName() {
        return classTeacherName;
    }

    public void setClassTeacherName(String classTeacherName) {
        this.classTeacherName = classTeacherName;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public int getTotalWeeklySlots() {
        return totalWeeklySlots;
    }

    public void setTotalWeeklySlots(int totalWeeklySlots) {
        this.totalWeeklySlots = totalWeeklySlots;
    }

    public int getAssignedSlotsCount() {
        return assignedSlotsCount;
    }

    public void setAssignedSlotsCount(int assignedSlotsCount) {
        this.assignedSlotsCount = assignedSlotsCount;
    }

    public int getUnassignedSlotsCount() {
        return unassignedSlotsCount;
    }

    public void setUnassignedSlotsCount(int unassignedSlotsCount) {
        this.unassignedSlotsCount = unassignedSlotsCount;
    }

    public Map<String, Map<Integer, TimetableSlotResponse>> getWeeklyGrid() {
        return weeklyGrid;
    }

    public void setWeeklyGrid(Map<String, Map<Integer, TimetableSlotResponse>> weeklyGrid) {
        this.weeklyGrid = weeklyGrid;
    }

    public List<TimetableSlotResponse> getSlots() {
        return slots;
    }

    public void setSlots(List<TimetableSlotResponse> slots) {
        this.slots = slots;
    }
}
