package com.schoolsystem.backend.timetable.dto.response;

import java.util.List;
import java.util.Map;

public class TeacherScheduleResponse {

    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
    private String phoneNumber;
    private Integer academicYear;

    private int totalTeachingPeriods;
    private int freePeriodsCount;
    private double weeklyWorkloadPercentage;

    // Day (e.g. MONDAY) -> Period (1..8) -> TimetableSlotResponse (with exact class, building, room code)
    private Map<String, Map<Integer, TimetableSlotResponse>> weeklyGrid;

    private List<TimetableSlotResponse> assignedSlots;

    public TeacherScheduleResponse() {
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public String getTeacherEmail() {
        return teacherEmail;
    }

    public void setTeacherEmail(String teacherEmail) {
        this.teacherEmail = teacherEmail;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public int getTotalTeachingPeriods() {
        return totalTeachingPeriods;
    }

    public void setTotalTeachingPeriods(int totalTeachingPeriods) {
        this.totalTeachingPeriods = totalTeachingPeriods;
    }

    public int getFreePeriodsCount() {
        return freePeriodsCount;
    }

    public void setFreePeriodsCount(int freePeriodsCount) {
        this.freePeriodsCount = freePeriodsCount;
    }

    public double getWeeklyWorkloadPercentage() {
        return weeklyWorkloadPercentage;
    }

    public void setWeeklyWorkloadPercentage(double weeklyWorkloadPercentage) {
        this.weeklyWorkloadPercentage = weeklyWorkloadPercentage;
    }

    public Map<String, Map<Integer, TimetableSlotResponse>> getWeeklyGrid() {
        return weeklyGrid;
    }

    public void setWeeklyGrid(Map<String, Map<Integer, TimetableSlotResponse>> weeklyGrid) {
        this.weeklyGrid = weeklyGrid;
    }

    public List<TimetableSlotResponse> getAssignedSlots() {
        return assignedSlots;
    }

    public void setAssignedSlots(List<TimetableSlotResponse> assignedSlots) {
        this.assignedSlots = assignedSlots;
    }
}
