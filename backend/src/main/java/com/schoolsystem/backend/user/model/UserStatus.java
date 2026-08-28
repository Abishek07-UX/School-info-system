package com.schoolsystem.backend.user.model;

/**
 * Strongly-typed domain enum representing account statuses.
 */
public enum UserStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    PENDING_APPROVAL("Pending Approval");

    private final String displayName;

    UserStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Case-insensitive lookup helper with fallback to ACTIVE for empty values.
     */
    public static UserStatus fromString(String raw) {
        if (raw == null || raw.isBlank()) {
            return ACTIVE;
        }
        try {
            return UserStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user status '" + raw + "'. Allowed statuses: ACTIVE, INACTIVE, PENDING_APPROVAL");
        }
    }
}
