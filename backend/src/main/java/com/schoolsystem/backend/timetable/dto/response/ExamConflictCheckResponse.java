package com.schoolsystem.backend.timetable.dto.response;

import java.util.ArrayList;
import java.util.List;

public class ExamConflictCheckResponse {

    private boolean hasConflict;
    private String conflictType; // 'NONE', 'CLASS_OVERLAP', 'INVIGILATOR_CLASH', 'VENUE_CLASH'
    private String message;

    private ExamScheduleResponse conflictingExamSlot;
    private List<String> warnings = new ArrayList<>();

    public ExamConflictCheckResponse() {
    }

    public static ExamConflictCheckResponse noConflict() {
        ExamConflictCheckResponse res = new ExamConflictCheckResponse();
        res.setHasConflict(false);
        res.setConflictType("NONE");
        res.setMessage("No examination collision detected. Exam schedule slot is valid.");
        return res;
    }

    public static ExamConflictCheckResponse classExamClash(ExamScheduleResponse slot, String className) {
        ExamConflictCheckResponse res = new ExamConflictCheckResponse();
        res.setHasConflict(true);
        res.setConflictType("CLASS_OVERLAP");
        res.setConflictingExamSlot(slot);
        res.setMessage(String.format(
                "Class Exam Clash: %s already has an examination in %s scheduled on %s from %s to %s.",
                className,
                slot.getSubjectName(),
                slot.getExamDate(),
                slot.getStartTime(),
                slot.getEndTime()
        ));
        return res;
    }

    public static ExamConflictCheckResponse invigilatorClash(ExamScheduleResponse slot, String invigilatorName) {
        ExamConflictCheckResponse res = new ExamConflictCheckResponse();
        res.setHasConflict(true);
        res.setConflictType("INVIGILATOR_CLASH");
        res.setConflictingExamSlot(slot);
        res.setMessage(String.format(
                "Invigilator Duty Clash: %s is already assigned to supervise %s (%s) on %s from %s to %s at %s.",
                invigilatorName,
                slot.getClassName(),
                slot.getSubjectName(),
                slot.getExamDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getRoom() != null ? slot.getRoom() : "Classroom"
        ));
        return res;
    }

    public static ExamConflictCheckResponse venueClash(ExamScheduleResponse slot, String roomName) {
        ExamConflictCheckResponse res = new ExamConflictCheckResponse();
        res.setHasConflict(true);
        res.setConflictType("VENUE_CLASH");
        res.setConflictingExamSlot(slot);
        res.setMessage(String.format(
                "Venue Conflict: Venue '%s' is already booked for %s (%s) on %s from %s to %s.",
                roomName,
                slot.getClassName(),
                slot.getSubjectName(),
                slot.getExamDate(),
                slot.getStartTime(),
                slot.getEndTime()
        ));
        return res;
    }

    public boolean isHasConflict() {
        return hasConflict;
    }

    public void setHasConflict(boolean hasConflict) {
        this.hasConflict = hasConflict;
    }

    public String getConflictType() {
        return conflictType;
    }

    public void setConflictType(String conflictType) {
        this.conflictType = conflictType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public ExamScheduleResponse getConflictingExamSlot() {
        return conflictingExamSlot;
    }

    public void setConflictingExamSlot(ExamScheduleResponse conflictingExamSlot) {
        this.conflictingExamSlot = conflictingExamSlot;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
