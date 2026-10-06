package com.schoolsystem.backend.finance.controller;

import com.schoolsystem.backend.common.dto.response.ApiResponse;
import com.schoolsystem.backend.finance.dto.request.FeeStructureRequest;
import com.schoolsystem.backend.finance.dto.request.RecordPaymentRequest;
import com.schoolsystem.backend.finance.dto.response.FeeStructureDTO;
import com.schoolsystem.backend.finance.dto.response.FinancialReportDTO;
import com.schoolsystem.backend.finance.dto.response.OutstandingBalanceDTO;
import com.schoolsystem.backend.finance.dto.response.PaymentReceiptDTO;
import com.schoolsystem.backend.finance.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @PostMapping("/fees/structures")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FeeStructureDTO> createFeeStructure(@Valid @RequestBody FeeStructureRequest request) {
        FeeStructureDTO created = financeService.createFeeStructure(request);
        return ApiResponse.success(created, "Fee structure configured successfully");
    }

    @GetMapping("/fees/structures")
    public ApiResponse<List<FeeStructureDTO>> getFeeStructures(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Integer academicYear
    ) {
        List<FeeStructureDTO> list = financeService.getFeeStructures(classId, academicYear);
        return ApiResponse.success(list, "Fee structures retrieved successfully");
    }

    @PutMapping("/fees/structures/{id}")
    public ApiResponse<FeeStructureDTO> updateFeeStructure(
            @PathVariable Long id,
            @Valid @RequestBody FeeStructureRequest request
    ) {
        FeeStructureDTO updated = financeService.updateFeeStructure(id, request);
        return ApiResponse.success(updated, "Fee structure updated successfully");
    }

    @DeleteMapping("/fees/structures/{id}")
    public ApiResponse<Void> deleteFeeStructure(@PathVariable Long id) {
        financeService.deleteFeeStructure(id);
        return ApiResponse.message("Fee structure deleted successfully");
    }

    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentReceiptDTO> recordPayment(
            @Valid @RequestBody RecordPaymentRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String clerkId = (jwt != null) ? jwt.getSubject() : null;
        PaymentReceiptDTO receipt = financeService.recordPayment(request, clerkId);
        return ApiResponse.success(receipt, "Payment recorded successfully with receipt: " + receipt.getReceiptNumber());
    }

    @GetMapping("/payments")
    public ApiResponse<List<PaymentReceiptDTO>> getPayments(
            @RequestParam(required = false) Long studentId
    ) {
        List<PaymentReceiptDTO> list = (studentId != null)
                ? financeService.getPaymentsByStudent(studentId)
                : financeService.getAllPayments();
        return ApiResponse.success(list, "Payments retrieved successfully");
    }

    @GetMapping("/finance/outstanding")
    public ApiResponse<List<OutstandingBalanceDTO>> getOutstanding(
            @RequestParam(required = false) Long classId
    ) {
        List<OutstandingBalanceDTO> list = financeService.getOutstandingPayments(classId);
        return ApiResponse.success(list, "Outstanding payment ledger retrieved successfully");
    }

    @GetMapping("/finance/reports")
    public ApiResponse<FinancialReportDTO> getFinancialReport() {
        FinancialReportDTO report = financeService.getFinancialReport();
        return ApiResponse.success(report, "Financial summary report generated successfully");
    }
}
