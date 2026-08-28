package com.schoolsystem.backend.user.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.List;

@Entity
@DiscriminatorValue("PRINCIPAL")
public class PrincipalUser extends User {

    public PrincipalUser() {
        super();
    }

    public PrincipalUser(String clerkId, String email, String firstName, String lastName,
                         String phoneNumber, String address, String nicNumber, UserStatus status) {
        super(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
    }

    @Override
    public UserRole getRole() {
        return UserRole.PRINCIPAL;
    }

    @Override
    public String getRoleDisplayName() {
        return UserRole.PRINCIPAL.getDisplayName();
    }

    @Override
    public List<String> getPermissions() {
        return List.of(
                "VIEW_ALL_REPORTS",
                "STUDENT_READ",
                "TEACHER_READ",
                "ATTENDANCE_READ",
                "ACADEMIC_READ",
                "FINANCE_READ",
                "TICKET_MANAGEMENT"
        );
    }

    @Override
    public boolean canAccessModule(String moduleName) {
        if (moduleName == null) return false;
        String mod = moduleName.trim().toUpperCase();
        return !mod.equals("USER_ADMINISTRATION");
    }
}
