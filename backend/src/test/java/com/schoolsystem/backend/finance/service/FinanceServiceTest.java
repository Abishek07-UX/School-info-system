package com.schoolsystem.backend.finance.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.finance.dto.request.FeeStructureRequest;
import com.schoolsystem.backend.finance.dto.request.RecordPaymentRequest;
import com.schoolsystem.backend.finance.dto.response.FeeStructureDTO;
import com.schoolsystem.backend.finance.dto.response.FinancialReportDTO;
import com.schoolsystem.backend.finance.dto.response.OutstandingBalanceDTO;
import com.schoolsystem.backend.finance.dto.response.PaymentReceiptDTO;
import com.schoolsystem.backend.finance.model.FeeStructure;
import com.schoolsystem.backend.finance.model.Payment;
import com.schoolsystem.backend.finance.repository.FeeStructureRepository;
import com.schoolsystem.backend.finance.repository.PaymentRepository;
import com.schoolsystem.backend.student.model.Student;
import com.schoolsystem.backend.student.repository.StudentRepository;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinanceServiceTest {

    @Mock
    private FeeStructureRepository feeStructureRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SchoolClassRepository schoolClassRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FinanceServiceImpl financeService;

    private SchoolClass testClass;
    private Student testStudent;
    private FeeStructure testFeeStructure;

    @BeforeEach
    void setUp() throws Exception {
        testClass = new SchoolClass("Grade 10-A", 10, 40, null);
        setId(testClass, 1L);

        testStudent = new Student("STU20260001", "Nimal", "Perera", LocalDate.now().minusYears(15), "MALE", "Colombo", "0771234567", "Sunil", "0777654321", testClass, null, 2026, "ACTIVE");
        setId(testStudent, 10L);

        testFeeStructure = new FeeStructure(testClass, "Term 1", 2026, "Tuition Fee", 15000.0, LocalDate.now().plusMonths(1));
        setId(testFeeStructure, 50L);
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
    @DisplayName("Should create fee structure successfully")
    void createFeeStructure_success() {
        FeeStructureRequest request = new FeeStructureRequest();
        request.setClassId(1L);
        request.setTerm("Term 1");
        request.setAcademicYear(2026);
        request.setFeeType("Tuition Fee");
        request.setAmount(15000.0);
        request.setDueDate(LocalDate.now().plusMonths(1));

        when(schoolClassRepository.findById(1L)).thenReturn(Optional.of(testClass));
        when(feeStructureRepository.save(any(FeeStructure.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FeeStructureDTO dto = financeService.createFeeStructure(request);

        assertNotNull(dto);
        assertEquals(15000.0, dto.getAmount());
        assertEquals("Term 1", dto.getTerm());
        verify(feeStructureRepository, times(1)).save(any(FeeStructure.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when fee amount is zero or negative")
    void createFeeStructure_fail_amountInvalid() {
        FeeStructureRequest request = new FeeStructureRequest();
        request.setClassId(1L);
        request.setAmount(0.0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                financeService.createFeeStructure(request)
        );
        assertTrue(ex.getMessage().contains("greater than zero"));
        verify(feeStructureRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update fee structure details and amount")
    void updateFeeStructure_success() {
        when(feeStructureRepository.findById(50L)).thenReturn(Optional.of(testFeeStructure));
        when(feeStructureRepository.save(any(FeeStructure.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FeeStructureRequest request = new FeeStructureRequest();
        request.setAmount(18000.0);
        request.setTerm("Term 2");

        FeeStructureDTO updated = financeService.updateFeeStructure(50L, request);

        assertNotNull(updated);
        assertEquals(18000.0, updated.getAmount());
        assertEquals("Term 2", updated.getTerm());
        verify(feeStructureRepository, times(1)).save(testFeeStructure);
    }

    @Test
    @DisplayName("Should record payment offline with generated receipt number")
    void recordPayment_success() {
        RecordPaymentRequest request = new RecordPaymentRequest();
        request.setStudentId(10L);
        request.setFeeStructureId(50L);
        request.setAmountPaid(10000.0);
        request.setPaymentMethod("CASH");
        request.setPaymentDate(LocalDate.now());

        when(studentRepository.findById(10L)).thenReturn(Optional.of(testStudent));
        when(feeStructureRepository.findById(50L)).thenReturn(Optional.of(testFeeStructure));
        when(paymentRepository.count()).thenReturn(0L);
        when(paymentRepository.findByReceiptNumber(anyString())).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.getTotalPaidByStudentAndFeeStructure(10L, 50L)).thenReturn(10000.0);

        PaymentReceiptDTO receipt = financeService.recordPayment(request, null);

        assertNotNull(receipt);
        assertTrue(receipt.getReceiptNumber().startsWith("REC-"));
        assertEquals(10000.0, receipt.getAmountPaid());
        assertEquals(15000.0, receipt.getTotalFeeAmount());
        assertEquals(5000.0, receipt.getRemainingBalance());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when payment amount is negative or zero")
    void recordPayment_fail_amountInvalid() {
        RecordPaymentRequest request = new RecordPaymentRequest();
        request.setStudentId(10L);
        request.setFeeStructureId(50L);
        request.setAmountPaid(-500.0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                financeService.recordPayment(request, null)
        );
        assertTrue(ex.getMessage().contains("greater than zero"));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should calculate outstanding balances per student and fee structure")
    void getOutstandingPayments_success() {
        when(studentRepository.findAll()).thenReturn(List.of(testStudent));
        when(feeStructureRepository.findAll()).thenReturn(List.of(testFeeStructure));
        when(paymentRepository.getTotalPaidByStudentAndFeeStructure(10L, 50L)).thenReturn(5000.0);

        List<OutstandingBalanceDTO> list = financeService.getOutstandingPayments(null);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(15000.0, list.get(0).getTotalFee());
        assertEquals(5000.0, list.get(0).getTotalPaid());
        assertEquals(10000.0, list.get(0).getOutstandingBalance());
        assertEquals("PARTIAL", list.get(0).getPaymentStatus());
    }

    @Test
    @DisplayName("Should generate accurate financial summary report")
    void getFinancialReport_success() {
        when(paymentRepository.getTotalCollections()).thenReturn(500000.0);
        when(studentRepository.findAll()).thenReturn(List.of(testStudent));
        when(feeStructureRepository.findAll()).thenReturn(List.of(testFeeStructure));
        when(paymentRepository.getTotalPaidByStudentAndFeeStructure(10L, 50L)).thenReturn(5000.0);
        when(paymentRepository.count()).thenReturn(25L);

        FinancialReportDTO report = financeService.getFinancialReport();

        assertNotNull(report);
        assertEquals(500000.0, report.getTotalCollected());
        assertEquals(10000.0, report.getTotalOutstanding());
        assertEquals(25L, report.getTotalTransactions());
    }
}
