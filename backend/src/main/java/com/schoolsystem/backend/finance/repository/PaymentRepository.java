package com.schoolsystem.backend.finance.repository;

import com.schoolsystem.backend.finance.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByReceiptNumber(String receiptNumber);

    List<Payment> findByStudentIdOrderByPaymentDateDesc(Long studentId);

    List<Payment> findByFeeStructureId(Long feeStructureId);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0.0) FROM Payment p WHERE p.student.id = :studentId AND p.feeStructure.id = :feeStructureId")
    Double getTotalPaidByStudentAndFeeStructure(@Param("studentId") Long studentId, @Param("feeStructureId") Long feeStructureId);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0.0) FROM Payment p")
    Double getTotalCollections();

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.student s LEFT JOIN FETCH s.schoolClass LEFT JOIN FETCH p.feeStructure fs LEFT JOIN FETCH fs.schoolClass LEFT JOIN FETCH p.recordedBy ORDER BY p.id DESC")
    List<Payment> findAllWithDetails();

    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.student s LEFT JOIN FETCH s.schoolClass LEFT JOIN FETCH p.feeStructure fs LEFT JOIN FETCH fs.schoolClass LEFT JOIN FETCH p.recordedBy WHERE p.student.id = :studentId ORDER BY p.paymentDate DESC, p.id DESC")
    List<Payment> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT p.student.id, p.feeStructure.id, COALESCE(SUM(p.amountPaid), 0.0) FROM Payment p GROUP BY p.student.id, p.feeStructure.id")
    List<Object[]> getAggregatedPaidPerStudentAndFeeStructure();
}
