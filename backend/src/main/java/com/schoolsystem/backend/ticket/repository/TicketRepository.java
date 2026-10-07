package com.schoolsystem.backend.ticket.repository;

import com.schoolsystem.backend.ticket.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    List<Ticket> findByRaisedByIdOrderByCreatedAtDesc(Long userId);

    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.raisedBy LEFT JOIN FETCH t.assignedTo WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:raisedById IS NULL OR t.raisedBy.id = :raisedById) " +
           "ORDER BY t.createdAt DESC")
    List<Ticket> findByFilters(
            @Param("status") String status,
            @Param("priority") String priority,
            @Param("category") String category,
            @Param("raisedById") Long raisedById
    );
}
