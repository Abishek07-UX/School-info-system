package com.schoolsystem.backend.user.model;

/**
 * Strongly-typed domain enum representing all user roles within the School Information System.
 */
public enum UserRole {
    ADMIN("Administrator"),
    PRINCIPAL("Principal"),
    TEACHER("Teacher"),
    FINANCE_STAFF("Finance Staff"),
    PENDING("Pending / Unassigned");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Case-insensitive lookup helper with fallback to PENDING for empty values.
     */
    public static UserRole fromString(String raw) {
        if (raw == null || raw.isBlank()) {
            return PENDING;
        }
        try {
            return UserRole.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user role '" + raw + "'. Allowed roles: ADMIN, PRINCIPAL, TEACHER, FINANCE_STAFF, PENDING");
        }
    }
}
