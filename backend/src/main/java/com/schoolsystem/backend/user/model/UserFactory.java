package com.schoolsystem.backend.user.model;

import org.springframework.stereotype.Component;

@Component
public class UserFactory {

    public User createUser(UserRole role) {
        if (role == null) {
            role = UserRole.PENDING;
        }
        return switch (role) {
            case ADMIN -> new AdminUser();
            case PRINCIPAL -> new PrincipalUser();
            case TEACHER -> new TeacherUser();
            case FINANCE_STAFF -> new FinanceStaffUser();
            case PENDING -> new PendingUser();
        };
    }

    public User createUserWithDetails(UserRole role, String clerkId, String email,
                                      String firstName, String lastName, String phoneNumber,
                                      String address, String nicNumber, UserStatus status) {
        if (role == null) {
            role = UserRole.PENDING;
        }
        return switch (role) {
            case ADMIN -> new AdminUser(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
            case PRINCIPAL -> new PrincipalUser(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
            case TEACHER -> new TeacherUser(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
            case FINANCE_STAFF -> new FinanceStaffUser(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
            case PENDING -> new PendingUser(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
        };
    }
}
