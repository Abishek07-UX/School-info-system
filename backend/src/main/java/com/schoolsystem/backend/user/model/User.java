package com.schoolsystem.backend.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Abstract Base Entity representing a staff member in the School Information System.
 * Uses JPA Single Table Inheritance with 'role' as the discriminator column.
 */
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clerk_id", nullable = false, unique = true)
    private String clerkId;

    @Column(nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "nic_number")
    private String nicNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    protected User() {
    }

    protected User(String clerkId, String email, String firstName, String lastName,
                   String phoneNumber, String address, String nicNumber, UserStatus status) {
        this.clerkId = clerkId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.nicNumber = nicNumber;
        this.status = status != null ? status : UserStatus.ACTIVE;
    }

    // Abstract OOP contracts
    public abstract UserRole getRole();
    public abstract List<String> getPermissions();
    public abstract String getRoleDisplayName();
    public abstract boolean canAccessModule(String moduleName);

    // Encapsulated domain methods
    public String getFullName() {
        if ((firstName == null || firstName.isBlank()) && (lastName == null || lastName.isBlank())) {
            return "Name Not Provided";
        }
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }

    public boolean isProfileComplete() {
        return nicNumber != null && nicNumber.matches("^([0-9]{12}|[0-9]{9}[V])$")
                && phoneNumber != null && phoneNumber.matches("^[0-9]{10}$")
                && address != null && !address.isBlank()
                && firstName != null && !firstName.isBlank()
                && lastName != null && !lastName.isBlank()
                && email != null && !email.isBlank() && !email.endsWith("@placeholder.com");
    }

    public void updateProfileDetails(String firstName, String lastName, String phoneNumber, String address, String nicNumber) {
        if (firstName != null) this.firstName = firstName.trim();
        if (lastName != null) this.lastName = lastName.trim();
        if (phoneNumber != null) this.phoneNumber = phoneNumber.trim();
        if (address != null) this.address = address.trim();
        if (nicNumber != null) this.nicNumber = nicNumber.trim().toUpperCase();
    }

    public void changeStatus(UserStatus newStatus) {
        this.status = newStatus != null ? newStatus : UserStatus.ACTIVE;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = UserStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNicNumber() {
        return nicNumber;
    }

    public void setNicNumber(String nicNumber) {
        this.nicNumber = nicNumber;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
