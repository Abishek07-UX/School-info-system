package com.schoolsystem.backend.timetable.dto.response;

import java.util.ArrayList;
import java.util.List;

public class ConflictCheckResponse {

    private boolean hasConflict;
    private String conflictType; // 'NONE', 'TEACHER_CLASH', 'CLASS_CLASH', 'MULTIPLE'
    private String message;

    private TimetableSlotResponse teacherConflictSlot;
    private TimetableSlotResponse classConflictSlot;

    private List<String> warnings = new ArrayList<>();

    public ConflictCheckResponse() {
    }

    public static ConflictCheckResponse noConflict() {
        ConflictCheckResponse res = new ConflictCheckResponse();
        res.setHasConflict(false);
        res.setConflictType("NONE");
        res.setMessage("No scheduling collision detected. Slot is available.");
        return res;
    }

    public static ConflictCheckResponse teacherClash(TimetableSlotResponse conflictingSlot, String teacherName) {
        ConflictCheckResponse res = new ConflictCheckResponse();
        res.setHasConflict(true);
        res.setConflictType("TEACHER_CLASH");
        res.setTeacherConflictSlot(conflictingSlot);
        res.setMessage(String.format(
                "Teacher Collision: %s is already scheduled to teach %s in %s on %s at %s (%s).",
                teacherName,
                conflictingSlot.getSubjectName(),
                conflictingSlot.getClassName(),
                conflictingSlot.getDayDisplayName(),
                conflictingSlot.getPeriodLabel(),
                conflictingSlot.getRoomCode() != null ? conflictingSlot.getRoomCode() : "Classroom"
        ));
        return res;
    }

    public static ConflictCheckResponse classClash(TimetableSlotResponse conflictingSlot, String className) {
        ConflictCheckResponse res = new ConflictCheckResponse();
        res.setHasConflict(true);
        res.setConflictType("CLASS_CLASH");
        res.setClassConflictSlot(conflictingSlot);
        res.setMessage(String.format(
                "Class Collision: %s is already scheduled for %s (Teacher: %s) on %s at %s.",
                className,
                conflictingSlot.getSubjectName(),
                conflictingSlot.getTeacherName(),
                conflictingSlot.getDayDisplayName(),
                conflictingSlot.getPeriodLabel()
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

    public TimetableSlotResponse getTeacherConflictSlot() {
        return teacherConflictSlot;
    }

    public void setTeacherConflictSlot(TimetableSlotResponse teacherConflictSlot) {
        this.teacherConflictSlot = teacherConflictSlot;
    }

    public TimetableSlotResponse getClassConflictSlot() {
        return classConflictSlot;
    }

    public void setClassConflictSlot(TimetableSlotResponse classConflictSlot) {
        this.classConflictSlot = classConflictSlot;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
