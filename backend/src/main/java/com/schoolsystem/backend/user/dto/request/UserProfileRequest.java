package com.schoolsystem.backend.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public class UserProfileRequest {

    @Email(message = "Please provide a valid email address")
    private String email;

    private String firstName;
    private String lastName;

    @Pattern(
        regexp = "^$|^[0-9]{10}$",
        message = "Phone number must contain exactly 10 digits with no letters or symbols (e.g. 0771234567)"
    )
    private String phoneNumber;

    private String address;

    @Pattern(
        regexp = "^$|^([0-9]{12}|[0-9]{9}[vV])$",
        message = "NIC number must be either 12 digits (e.g. 199012345678) or 9 digits followed by 'V' (e.g. 901234567V)"
    )
    private String nicNumber;

    public UserProfileRequest() {
    }

    public UserProfileRequest(String email, String firstName, String lastName, String phoneNumber, String address, String nicNumber) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.nicNumber = nicNumber;
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
}
