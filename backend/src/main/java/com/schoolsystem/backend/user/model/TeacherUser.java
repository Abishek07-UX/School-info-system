package com.schoolsystem.backend.user.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.List;

@Entity
@DiscriminatorValue("TEACHER")
public class TeacherUser extends User {

    public TeacherUser() {
        super();
    }

    public TeacherUser(String clerkId, String email, String firstName, String lastName,
                       String phoneNumber, String address, String nicNumber, UserStatus status) {
        super(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
    }

    @Override
    public UserRole getRole() {
        return UserRole.TEACHER;
    }

    @Override
    public String getRoleDisplayName() {
        return UserRole.TEACHER.getDisplayName();
    }

    @Override
    public List<String> getPermissions() {
        return List.of(
                "ATTENDANCE_RECORD",
                "ATTENDANCE_VIEW",
                "MARKS_ENTER",
                "EXAMS_VIEW",
                "STUDENT_READ",
                "TIMETABLE_VIEW",
                "TICKET_CREATE",
                "TICKET_VIEW_OWN"
        );
    }

    @Override
    public boolean canAccessModule(String moduleName) {
        if (moduleName == null) return false;
        String mod = moduleName.trim().toUpperCase();
        return mod.equals("ATTENDANCE")
                || mod.equals("ACADEMICS")
                || mod.equals("EXAMINATIONS")
                || mod.equals("STUDENTS")
                || mod.equals("TICKETS");
    }
}
