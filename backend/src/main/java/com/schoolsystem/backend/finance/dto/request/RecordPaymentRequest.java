package com.schoolsystem.backend.finance.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class RecordPaymentRequest {

    @NotNull(message = "Student ID is mandatory")
    private Long studentId;

    @NotNull(message = "Fee structure ID is mandatory")
    private Long feeStructureId;

    @NotNull(message = "Amount paid is mandatory")
    private Double amountPaid;

    private LocalDate paymentDate;

    @NotNull(message = "Payment method is mandatory (CASH, BANK_TRANSFER, CHEQUE)")
    private String paymentMethod;

    private String remarks;

    public RecordPaymentRequest() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getFeeStructureId() {
        return feeStructureId;
    }

    public void setFeeStructureId(Long feeStructureId) {
        this.feeStructureId = feeStructureId;
    }

    public Double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(Double amountPaid) {
        this.amountPaid = amountPaid;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
