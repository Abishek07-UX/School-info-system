package com.schoolsystem.backend.finance.dto.response;

import com.schoolsystem.backend.finance.model.Payment;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PaymentReceiptDTO {

    private Long id;
    private String receiptNumber;
    private Long studentId;
    private String admissionNumber;
    private String studentName;
    private String className;
    private String feeType;
    private String term;
    private Double totalFeeAmount;
    private Double amountPaid;
    private Double remainingBalance;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String remarks;
    private String recordedByName;
    private LocalDateTime createdAt;

    public PaymentReceiptDTO() {
    }

    public PaymentReceiptDTO(Payment p, Double totalFee, Double totalPaidSoFar) {
        if (p == null) return;
        this.id = p.getId();
        this.receiptNumber = p.getReceiptNumber();
        if (p.getStudent() != null) {
            this.studentId = p.getStudent().getId();
            this.admissionNumber = p.getStudent().getAdmissionNumber();
            this.studentName = p.getStudent().getFullName();
            if (p.getStudent().getSchoolClass() != null) {
                this.className = p.getStudent().getSchoolClass().getName();
            }
        }
        if (p.getFeeStructure() != null) {
            this.feeType = p.getFeeStructure().getFeeType();
            this.term = p.getFeeStructure().getTerm();
            this.totalFeeAmount = (totalFee != null) ? totalFee : p.getFeeStructure().getAmount();
            if (this.className == null && p.getFeeStructure().getSchoolClass() != null) {
                this.className = p.getFeeStructure().getSchoolClass().getName();
            }
        }
        this.amountPaid = p.getAmountPaid();
        if (this.totalFeeAmount != null && totalPaidSoFar != null) {
            this.remainingBalance = Math.max(0.0, this.totalFeeAmount - totalPaidSoFar);
        } else {
            this.remainingBalance = 0.0;
        }
        this.paymentDate = p.getPaymentDate();
        this.paymentMethod = p.getPaymentMethod();
        this.remarks = p.getRemarks();
        if (p.getRecordedBy() != null) {
            this.recordedByName = p.getRecordedBy().getFullName();
        }
        this.createdAt = p.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getReceiptNumber() {
        return receiptNumber;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getAdmissionNumber() {
        return admissionNumber;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getClassName() {
        return className;
    }

    public String getFeeType() {
        return feeType;
    }

    public String getTerm() {
        return term;
    }

    public Double getTotalFeeAmount() {
        return totalFeeAmount;
    }

    public Double getAmountPaid() {
        return amountPaid;
    }

    public Double getRemainingBalance() {
        return remainingBalance;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getRemarks() {
        return remarks;
    }

    public String getRecordedByName() {
        return recordedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
