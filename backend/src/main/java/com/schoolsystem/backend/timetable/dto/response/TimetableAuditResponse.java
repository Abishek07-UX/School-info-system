package com.schoolsystem.backend.timetable.dto.response;

import java.util.ArrayList;
import java.util.List;

public class TimetableAuditResponse {

    private int totalClasses;
    private int totalAssignedSlots;
    private int totalTeachersScheduled;
    private int totalConflictsFound;
    private boolean isConflictFree;

    private List<ConflictCheckResponse> conflicts = new ArrayList<>();
    private List<String> unassignedClassSummaries = new ArrayList<>();

    public TimetableAuditResponse() {
    }

    public int getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }

    public int getTotalAssignedSlots() {
        return totalAssignedSlots;
    }

    public void setTotalAssignedSlots(int totalAssignedSlots) {
        this.totalAssignedSlots = totalAssignedSlots;
    }

    public int getTotalTeachersScheduled() {
        return totalTeachersScheduled;
    }

    public void setTotalTeachersScheduled(int totalTeachersScheduled) {
        this.totalTeachersScheduled = totalTeachersScheduled;
    }

    public int getTotalConflictsFound() {
        return totalConflictsFound;
    }

    public void setTotalConflictsFound(int totalConflictsFound) {
        this.totalConflictsFound = totalConflictsFound;
    }

    public boolean isConflictFree() {
        return isConflictFree;
    }

    public void setConflictFree(boolean conflictFree) {
        isConflictFree = conflictFree;
    }

    public List<ConflictCheckResponse> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<ConflictCheckResponse> conflicts) {
        this.conflicts = conflicts;
    }

    public List<String> getUnassignedClassSummaries() {
        return unassignedClassSummaries;
    }

    public void setUnassignedClassSummaries(List<String> unassignedClassSummaries) {
        this.unassignedClassSummaries = unassignedClassSummaries;
    }
}
