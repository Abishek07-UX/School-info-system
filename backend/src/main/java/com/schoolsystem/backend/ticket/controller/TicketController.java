package com.schoolsystem.backend.ticket.controller;

import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.ticket.dto.request.AssignTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.BatchDeleteTicketsRequest;
import com.schoolsystem.backend.ticket.dto.request.CreateTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.ResolveTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.UpdateTicketRequest;
import com.schoolsystem.backend.ticket.dto.response.TicketDTO;
import com.schoolsystem.backend.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TicketDTO> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String clerkId = (jwt != null) ? jwt.getSubject() : null;
        TicketDTO created = ticketService.createTicket(request, clerkId);
        return ApiResponse.success(created, "Support ticket raised successfully: " + created.getTicketNumber());
    }

    @GetMapping
    public ApiResponse<List<TicketDTO>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long raisedById
    ) {
        List<TicketDTO> list = ticketService.getTickets(status, priority, category, raisedById);
        return ApiResponse.success(list, "Tickets retrieved successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<TicketDTO> getTicketById(@PathVariable Long id) {
        TicketDTO ticket = ticketService.getTicketById(id);
        return ApiResponse.success(ticket, "Ticket retrieved successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<TicketDTO> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request
    ) {
        TicketDTO updated = ticketService.updateTicket(id, request);
        return ApiResponse.success(updated, "Ticket details updated successfully");
    }

    @PostMapping("/{id}/assign")
    public ApiResponse<TicketDTO> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request
    ) {
        TicketDTO updated = ticketService.assignTicket(id, request);
        return ApiResponse.success(updated, "Ticket assigned successfully");
    }

    @PostMapping("/{id}/resolve")
    public ApiResponse<TicketDTO> resolveTicket(
            @PathVariable Long id,
            @Valid @RequestBody ResolveTicketRequest request
    ) {
        TicketDTO updated = ticketService.resolveTicket(id, request);
        return ApiResponse.success(updated, "Ticket marked as resolved");
    }

    @DeleteMapping("/batch")
    public ApiResponse<Void> batchDeleteTickets(@Valid @RequestBody BatchDeleteTicketsRequest request) {
        ticketService.batchDeleteTickets(request.getTicketIds());
        return ApiResponse.message(request.getTicketIds().size() + " tickets deleted successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ApiResponse.message("Ticket deleted successfully");
    }
}
