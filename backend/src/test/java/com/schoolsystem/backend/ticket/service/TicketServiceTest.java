package com.schoolsystem.backend.ticket.service;

import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.ticket.dto.request.AssignTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.CreateTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.ResolveTicketRequest;
import com.schoolsystem.backend.ticket.dto.request.UpdateTicketRequest;
import com.schoolsystem.backend.ticket.dto.response.TicketDTO;
import com.schoolsystem.backend.ticket.model.Ticket;
import com.schoolsystem.backend.ticket.repository.TicketRepository;
import com.schoolsystem.backend.user.model.TeacherUser;
import com.schoolsystem.backend.user.model.UserStatus;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private TeacherUser user;
    private Ticket testTicket;

    @BeforeEach
    void setUp() throws Exception {
        user = new TeacherUser("clerk_t1", "kamal@school.lk", "Kamal", "Silva", "0771234567", "Colombo", "851234567V", UserStatus.ACTIVE);
        setId(user, 10L);

        testTicket = new Ticket(
                "TCK-2026-0001",
                "Fix student DOB",
                "Student STU20260001 has incorrect birth year",
                "DATA_CORRECTION",
                "HIGH",
                user
        );
        setId(testTicket, 100L);
    }

    private void setId(Object entity, Long id) throws Exception {
        Field idField;
        try {
            idField = entity.getClass().getDeclaredField("id");
        } catch (NoSuchFieldException e) {
            idField = entity.getClass().getSuperclass().getDeclaredField("id");
        }
        idField.setAccessible(true);
        idField.set(entity, id);
    }

    @Test
    @DisplayName("Should create support ticket with generated ticket number")
    void createTicket_success() {
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Fix student DOB");
        request.setDescription("Student STU20260001 has incorrect birth year");
        request.setCategory("DATA_CORRECTION");
        request.setPriority("HIGH");

        when(userRepository.findByClerkId("clerk_t1")).thenReturn(Optional.of(user));
        when(ticketRepository.count()).thenReturn(0L);
        when(ticketRepository.findByTicketNumber(anyString())).thenReturn(Optional.empty());
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketDTO created = ticketService.createTicket(request, "clerk_t1");

        assertNotNull(created);
        assertTrue(created.getTicketNumber().startsWith("TCK-"));
        assertEquals("Fix student DOB", created.getTitle());
        assertEquals("OPEN", created.getStatus());
        assertEquals("HIGH", created.getPriority());
        verify(ticketRepository, times(1)).save(any(Ticket.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when ticket category is invalid")
    void createTicket_fail_invalidCategory() {
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Fix issue");
        request.setDescription("Details");
        request.setCategory("INVALID_CATEGORY");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                ticketService.createTicket(request, "clerk_t1")
        );
        assertTrue(ex.getMessage().contains("Invalid ticket category"));
        verify(ticketRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get tickets with filters")
    void getTickets_withFilters() {
        when(ticketRepository.findByFilters(eq("OPEN"), eq("HIGH"), eq("DATA_CORRECTION"), eq(10L)))
                .thenReturn(List.of(testTicket));

        List<TicketDTO> list = ticketService.getTickets("OPEN", "HIGH", "DATA_CORRECTION", 10L);

        assertEquals(1, list.size());
        assertEquals("TCK-2026-0001", list.get(0).getTicketNumber());
    }

    @Test
    @DisplayName("Should update ticket details")
    void updateTicket_success() {
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setTitle("Updated Title");
        request.setPriority("URGENT");

        TicketDTO updated = ticketService.updateTicket(100L, request);

        assertNotNull(updated);
        assertEquals("Updated Title", updated.getTitle());
        assertEquals("URGENT", updated.getPriority());
        verify(ticketRepository, times(1)).save(testTicket);
    }

    @Test
    @DisplayName("Should throw IllegalStateException when updating an already resolved ticket")
    void updateTicket_fail_alreadyResolved() {
        testTicket.setStatus("RESOLVED");
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(testTicket));

        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setTitle("Attempted Change");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                ticketService.updateTicket(100L, request)
        );
        assertTrue(ex.getMessage().contains("already been resolved"));
        verify(ticketRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when updating with an invalid category")
    void updateTicket_fail_invalidCategory() {
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(testTicket));

        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setCategory("NON_EXISTENT_CATEGORY");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                ticketService.updateTicket(100L, request)
        );
        assertTrue(ex.getMessage().contains("Invalid ticket category"));
        verify(ticketRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should assign ticket to staff and transition status from OPEN to IN_PROGRESS")
    void assignTicket_success() {
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(testTicket));
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AssignTicketRequest request = new AssignTicketRequest();
        request.setAssignedToUserId(10L);

        TicketDTO assigned = ticketService.assignTicket(100L, request);

        assertNotNull(assigned);
        assertEquals("IN_PROGRESS", assigned.getStatus());
        assertEquals(10L, assigned.getAssignedToId());
        verify(ticketRepository, times(1)).save(testTicket);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when assignee not found")
    void assignTicket_fail_userNotFound() {
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(testTicket));
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        AssignTicketRequest request = new AssignTicketRequest();
        request.setAssignedToUserId(999L);

        assertThrows(ResourceNotFoundException.class, () ->
                ticketService.assignTicket(100L, request)
        );
    }

    @Test
    @DisplayName("Should resolve ticket with resolution notes and timestamp")
    void resolveTicket_success() {
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(testTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResolveTicketRequest request = new ResolveTicketRequest();
        request.setResolutionNotes("DOB updated to 2011-05-12 in student registry");

        TicketDTO resolved = ticketService.resolveTicket(100L, request);

        assertNotNull(resolved);
        assertEquals("RESOLVED", resolved.getStatus());
        assertEquals("DOB updated to 2011-05-12 in student registry", resolved.getResolutionNotes());
        assertNotNull(resolved.getResolvedAt());
        verify(ticketRepository, times(1)).save(testTicket);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when resolution notes are blank")
    void resolveTicket_fail_blankNotes() {
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(testTicket));

        ResolveTicketRequest request = new ResolveTicketRequest();
        request.setResolutionNotes("   ");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                ticketService.resolveTicket(100L, request)
        );
        assertTrue(ex.getMessage().contains("mandatory"));
        verify(ticketRepository, never()).save(any());
    }
}
