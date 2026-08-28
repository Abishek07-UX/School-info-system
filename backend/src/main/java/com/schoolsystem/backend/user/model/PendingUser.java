package com.schoolsystem.backend.user.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.util.Collections;
import java.util.List;

@Entity
@DiscriminatorValue("PENDING")
public class PendingUser extends User {

    public PendingUser() {
        super();
    }

    public PendingUser(String clerkId, String email, String firstName, String lastName,
                       String phoneNumber, String address, String nicNumber, UserStatus status) {
        super(clerkId, email, firstName, lastName, phoneNumber, address, nicNumber, status);
    }

    @Override
    public UserRole getRole() {
        return UserRole.PENDING;
    }

    @Override
    public String getRoleDisplayName() {
        return UserRole.PENDING.getDisplayName();
    }

    @Override
    public List<String> getPermissions() {
        return Collections.emptyList();
    }

    @Override
    public boolean canAccessModule(String moduleName) {
        return false;
    }
}
