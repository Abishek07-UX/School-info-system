package com.schoolsystem.backend.security;

public class UserPrincipal {

    private final Long id;
    private final String clerkId;
    private final String email;
    private final String role;

    public UserPrincipal(Long id, String clerkId, String email, String role) {
        this.id = id;
        this.clerkId = clerkId;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getClerkId() {
        return clerkId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}