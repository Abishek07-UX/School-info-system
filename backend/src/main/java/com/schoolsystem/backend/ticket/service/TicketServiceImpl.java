package com.schoolsystem.backend.ticket.service;

import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.ticket.dto.request.AssignTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.CreateTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.ResolveTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.UpdateTicketRequest;
import com.schoolsystem.backend.ticket.dto.response.TicketDTO;
import com.schoolsystem.backend.ticket.model.Ticket;
import com.schoolsystem.backend.ticket.repository.TicketRepository;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketServiceImpl(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public TicketDTO createTicket(CreateTicketRequest request, String userClerkId) {
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new IllegalArgumentException("Ticket category is mandatory");
        }
        String catUpper = request.getCategory().trim().toUpperCase();
        List<String> validCategories = List.of("DATA_CORRECTION", "TECHNICAL", "ADMINISTRATIVE", "ACADEMIC", "OTHER");
        if (!validCategories.contains(catUpper)) {
            throw new IllegalArgumentException("Invalid ticket category: " + request.getCategory());
        }

        User raiser = (userClerkId != null)
                ? userRepository.findByClerkId(userClerkId).orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Logged-in user not found"))
                : userRepository.findAll().stream().findFirst().orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "No system user found"));

        int year = LocalDate.now().getYear();
        long count = ticketRepository.count() + 1;
        String ticketNumber = String.format("TCK-%d-%04d", year, count);
        while (ticketRepository.findByTicketNumber(ticketNumber).isPresent()) {
            count++;
            ticketNumber = String.format("TCK-%d-%04d", year, count);
        }

        Ticket ticket = new Ticket(
                ticketNumber,
                request.getTitle().trim(),
                request.getDescription().trim(),
                catUpper,
                request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM",
                raiser
        );

        Ticket saved = ticketRepository.save(ticket);
        return new TicketDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketDTO> getTickets(String status, String priority, String category, Long raisedById) {
        String cleanStatus = (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) ? status.trim().toUpperCase() : null;
        String cleanPriority = (priority != null && !priority.trim().isEmpty() && !priority.equalsIgnoreCase("ALL")) ? priority.trim().toUpperCase() : null;
        String cleanCategory = (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("ALL")) ? category.trim().toUpperCase() : null;

        return ticketRepository.findByFilters(cleanStatus, cleanPriority, cleanCategory, raisedById)
                .stream()
                .map(TicketDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TICKET_NOT_FOUND", "Ticket not found with id: " + id));
        return new TicketDTO(ticket);
    }

    @Override
    @Transactional
    public TicketDTO updateTicket(Long id, UpdateTicketRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TICKET_NOT_FOUND", "Ticket not found with id: " + id));

        if ("RESOLVED".equalsIgnoreCase(ticket.getStatus()) || "CLOSED".equalsIgnoreCase(ticket.getStatus())) {
            throw new IllegalStateException("Cannot modify a ticket that has already been resolved or closed.");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            ticket.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null && !request.getDescription().isBlank()) {
            ticket.setDescription(request.getDescription().trim());
        }
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            String catUpper = request.getCategory().trim().toUpperCase();
            List<String> validCategories = List.of("DATA_CORRECTION", "TECHNICAL", "ADMINISTRATIVE", "ACADEMIC", "OTHER");
            if (!validCategories.contains(catUpper)) {
                throw new IllegalArgumentException("Invalid ticket category: " + request.getCategory());
            }
            ticket.setCategory(catUpper);
        }
        if (request.getPriority() != null && !request.getPriority().isBlank()) {
            ticket.setPriority(request.getPriority().toUpperCase());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            ticket.setStatus(request.getStatus().toUpperCase());
        }

        Ticket saved = ticketRepository.save(ticket);
        return new TicketDTO(saved);
    }

    @Override
    @Transactional
    public TicketDTO assignTicket(Long id, AssignTicketRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TICKET_NOT_FOUND", "Ticket not found with id: " + id));

        User assignee = userRepository.findById(request.getAssignedToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "Assignee user not found with id: " + request.getAssignedToUserId()));

        ticket.setAssignedTo(assignee);
        if ("OPEN".equals(ticket.getStatus())) {
            ticket.setStatus("IN_PROGRESS");
        }

        Ticket saved = ticketRepository.save(ticket);
        return new TicketDTO(saved);
    }

    @Override
    @Transactional
    public TicketDTO resolveTicket(Long id, ResolveTicketRequest request) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TICKET_NOT_FOUND", "Ticket not found with id: " + id));

        if (request.getResolutionNotes() == null || request.getResolutionNotes().isBlank()) {
            throw new IllegalArgumentException("Resolution notes are mandatory to resolve a ticket");
        }

        ticket.setStatus("RESOLVED");
        ticket.setResolutionNotes(request.getResolutionNotes().trim());
        ticket.setResolvedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        return new TicketDTO(saved);
    }

    @Override
    @Transactional
    public void batchDeleteTickets(List<Long> ticketIds) {
        if (ticketIds == null || ticketIds.isEmpty()) {
            throw new IllegalArgumentException("List of ticket IDs to delete cannot be empty");
        }
        ticketRepository.deleteAllById(ticketIds);
    }

    @Override
    @Transactional
    public void deleteTicket(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("TICKET_NOT_FOUND", "Ticket not found with id: " + id);
        }
        ticketRepository.deleteById(id);
    }
}
