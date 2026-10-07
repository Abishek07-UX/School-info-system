package com.schoolsystem.backend.ticket.service;

import com.schoolsystem.backend.ticket.dto.request.AssignTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.CreateTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.ResolveTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.UpdateTicketRequest;
import com.schoolsystem.backend.ticket.dto.response.TicketDTO;

import java.util.List;

public interface TicketService {

    TicketDTO createTicket(CreateTicketRequest request, String userClerkId);

    List<TicketDTO> getTickets(String status, String priority, String category, Long raisedById);

    TicketDTO getTicketById(Long id);

    TicketDTO updateTicket(Long id, UpdateTicketRequest request);

    TicketDTO assignTicket(Long id, AssignTicketRequest request);

    TicketDTO resolveTicket(Long id, ResolveTicketRequest request);

    void batchDeleteTickets(List<Long> ticketIds);

    void deleteTicket(Long id);
}
