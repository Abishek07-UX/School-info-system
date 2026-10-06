package com.schoolsystem.backend.finance.service;

import com.schoolsystem.backend.finance.dto.request.FeeStructureRequest;
import com.schoolsystem.backend.finance.dto.request.RecordPaymentRequest;
import com.schoolsystem.backend.finance.dto.response.FeeStructureDTO;
import com.schoolsystem.backend.finance.dto.response.FinancialReportDTO;
import com.schoolsystem.backend.finance.dto.response.OutstandingBalanceDTO;
import com.schoolsystem.backend.finance.dto.response.PaymentReceiptDTO;

import java.util.List;

public interface FinanceService {

    FeeStructureDTO createFeeStructure(FeeStructureRequest request);

    List<FeeStructureDTO> getFeeStructures(Long classId, Integer academicYear);

    FeeStructureDTO updateFeeStructure(Long id, FeeStructureRequest request);

    void deleteFeeStructure(Long id);

    PaymentReceiptDTO recordPayment(RecordPaymentRequest request, String userClerkId);

    List<PaymentReceiptDTO> getPaymentsByStudent(Long studentId);

    List<PaymentReceiptDTO> getAllPayments();

    List<OutstandingBalanceDTO> getOutstandingPayments(Long classId);

    FinancialReportDTO getFinancialReport();
}
