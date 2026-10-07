package com.schoolsystem.backend.ticket.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BatchDeleteTicketsRequest {

    @NotEmpty(message = "Ticket IDs list cannot be empty")
    private List<Long> ticketIds;

    public BatchDeleteTicketsRequest() {
    }

    public BatchDeleteTicketsRequest(List<Long> ticketIds) {
        this.ticketIds = ticketIds;
    }

    public List<Long> getTicketIds() {
        return ticketIds;
    }

    public void setTicketIds(List<Long> ticketIds) {
        this.ticketIds = ticketIds;
    }
}
