package com.schoolsystem.backend.user.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.List;

@Entity
@DiscriminatorValue("ADMIN")
public class AdminUser extends User {

    public AdminUser() {
        super();
    }

    public AdminUser(String clerkId, String email, String firstName, String lastName,
                     String phoneNumber, String address, String nicNumber, UserStatus status) {
        super(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
    }

    @Override
    public UserRole getRole() {
        return UserRole.ADMIN;
    }

    @Override
    public String getRoleDisplayName() {
        return UserRole.ADMIN.getDisplayName();
    }

    @Override
    public List<String> getPermissions() {
        return List.of(
                "ALL_ACCESS",
                "USER_MANAGEMENT",
                "ADMINISTRATION",
                "STUDENT_MANAGEMENT",
                "TEACHER_MANAGEMENT",
                "ATTENDANCE_MANAGEMENT",
                "ACADEMIC_MANAGEMENT",
                "FINANCE_MANAGEMENT",
                "TICKET_MANAGEMENT"
        );
    }

    @Override
    public boolean canAccessModule(String moduleName) {
        return true;
    }
}
