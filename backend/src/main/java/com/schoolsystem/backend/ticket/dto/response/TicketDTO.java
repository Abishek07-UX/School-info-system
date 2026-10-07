package com.schoolsystem.backend.ticket.dto.response;

import com.schoolsystem.backend.ticket.model.Ticket;
import java.time.LocalDateTime;

public class TicketDTO {

    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;

    private Long raisedById;
    private String raisedByName;
    private String raisedByRole;

    private Long assignedToId;
    private String assignedToName;

    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public TicketDTO() {
    }

    public TicketDTO(Ticket t) {
        if (t == null) return;
        this.id = t.getId();
        this.ticketNumber = t.getTicketNumber();
        this.title = t.getTitle();
        this.description = t.getDescription();
        this.category = t.getCategory();
        this.priority = t.getPriority();
        this.status = t.getStatus();

        if (t.getRaisedBy() != null) {
            this.raisedById = t.getRaisedBy().getId();
            this.raisedByName = t.getRaisedBy().getFullName();
            this.raisedByRole = t.getRaisedBy().getRole() != null ? t.getRaisedBy().getRole().name() : null;
        }

        if (t.getAssignedTo() != null) {
            this.assignedToId = t.getAssignedTo().getId();
            this.assignedToName = t.getAssignedTo().getFullName();
        }

        this.resolutionNotes = t.getResolutionNotes();
        this.createdAt = t.getCreatedAt();
        this.resolvedAt = t.getResolvedAt();
    }

    public Long getId() {
        return id;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public Long getRaisedById() {
        return raisedById;
    }

    public String getRaisedByName() {
        return raisedByName;
    }

    public String getRaisedByRole() {
        return raisedByRole;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }
}
