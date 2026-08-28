package com.schoolsystem.backend.user.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.List;

@Entity
@DiscriminatorValue("FINANCE_STAFF")
public class FinanceStaffUser extends User {

    public FinanceStaffUser() {
        super();
    }

    public FinanceStaffUser(String clerkId, String email, String firstName, String lastName,
                            String phoneNumber, String address, String nicNumber, UserStatus status) {
        super(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
    }

    @Override
    public UserRole getRole() {
        return UserRole.FINANCE_STAFF;
    }

    @Override
    public String getRoleDisplayName() {
        return UserRole.FINANCE_STAFF.getDisplayName();
    }

    @Override
    public List<String> getPermissions() {
        return List.of(
                "FEES_MANAGE",
                "PAYMENTS_RECORD",
                "PAYMENTS_VIEW",
                "FINANCIAL_REPORTS_VIEW",
                "STUDENT_READ",
                "TICKET_CREATE",
                "TICKET_VIEW_OWN"
        );
    }

    @Override
    public boolean canAccessModule(String moduleName) {
        if (moduleName == null) return false;
        String mod = moduleName.trim().toUpperCase();
        return mod.equals("FINANCE")
                || mod.equals("FEES")
                || mod.equals("STUDENTS")
                || mod.equals("TICKETS");
    }
}
