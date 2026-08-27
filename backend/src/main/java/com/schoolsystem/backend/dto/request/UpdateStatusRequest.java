package com.schoolsystem.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateStatusRequest {

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, INACTIVE, PENDING_APPROVAL

    public UpdateStatusRequest() {
    }

    public UpdateStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
