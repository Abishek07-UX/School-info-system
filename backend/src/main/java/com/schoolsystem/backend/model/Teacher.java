package com.schoolsystem.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Personal Information
    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    @Column(nullable = false, unique = true)
    private String email;

    @Pattern(
        regexp = "^[0-9+\\- ]{10,15}$",
        message = "Enter a valid phone number"
    )
    private String phoneNumber;

    // Qualification and Employment
    @NotBlank(message = "Qualification is required")
    private String qualification;

    @NotBlank(message = "Employment status is required")
    private String employmentStatus;

    // Subject and Class Assignment
    private String subject;

    private String assignedClass;

    // Teacher Profile
    @Column(length = 2000)
    private String teachingHistory;

    @Column(length = 2000)
    private String performanceNotes;

    // Teacher availability
    private String availability;

    // Active / Inactive status
    @Builder.Default
    private boolean active = true;
}