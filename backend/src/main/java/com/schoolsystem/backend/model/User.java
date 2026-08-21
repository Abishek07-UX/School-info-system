package com.schoolsystem.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clerk_id", nullable = false, unique = true)
    private String clerkId;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role; // ADMIN, PRINCIPAL, TEACHER, FINANCE_STAFF

    public User() {
    }

    public Long getId() {
        return id;
    }

    public String getClerkId() {
        return clerkId;
    }

    public void setClerkId(String clerkId) {
        this.clerkId = clerkId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}