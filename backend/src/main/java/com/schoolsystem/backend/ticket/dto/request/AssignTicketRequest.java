package com.schoolsystem.backend.ticket.dto.request;

import jakarta.validation.constraints.NotNull;

public class AssignTicketRequest {

    @NotNull(message = "Assigned user ID is mandatory")
    private Long assignedToUserId;

    public AssignTicketRequest() {
    }

    public AssignTicketRequest(Long assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public Long getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(Long assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }
}
