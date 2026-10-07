package com.schoolsystem.backend.ticket.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreateTicketRequest {

    @NotBlank(message = "Ticket title is mandatory")
    private String title;

    @NotBlank(message = "Ticket description is mandatory")
    private String description;

    @NotBlank(message = "Category is mandatory (DATA_CORRECTION, TECHNICAL, ADMINISTRATIVE, ACADEMIC, OTHER)")
    private String category;

    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    public CreateTicketRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}
