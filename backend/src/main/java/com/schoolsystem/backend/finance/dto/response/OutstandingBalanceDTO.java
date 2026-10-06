package com.schoolsystem.backend.finance.dto.response;

public class OutstandingBalanceDTO {

    private Long studentId;
    private String admissionNumber;
    private String studentName;
    private Long classId;
    private String className;
    private Long feeStructureId;
    private String feeType;
    private String term;
    private Double totalFee;
    private Double totalPaid;
    private Double outstandingBalance;
    private String paymentStatus; // PAID, PARTIAL, UNPAID

    public OutstandingBalanceDTO() {
    }

    public OutstandingBalanceDTO(Long studentId, String admissionNumber, String studentName,
                                 Long classId, String className, Long feeStructureId,
                                 String feeType, String term, Double totalFee, Double totalPaid) {
        this.studentId = studentId;
        this.admissionNumber = admissionNumber;
        this.studentName = studentName;
        this.classId = classId;
        this.className = className;
        this.feeStructureId = feeStructureId;
        this.feeType = feeType;
        this.term = term;
        this.totalFee = totalFee != null ? totalFee : 0.0;
        this.totalPaid = totalPaid != null ? totalPaid : 0.0;
        this.outstandingBalance = Math.max(0.0, this.totalFee - this.totalPaid);

        if (this.totalPaid >= this.totalFee) {
            this.paymentStatus = "PAID";
        } else if (this.totalPaid > 0) {
            this.paymentStatus = "PARTIAL";
        } else {
            this.paymentStatus = "UNPAID";
        }
    }

    public OutstandingBalanceDTO(Long studentId, String admissionNumber, String studentName,
                                 Long classId, String className, Long feeStructureId,
                                 String feeType, String term, Double totalFee, Double totalPaid,
                                 Double outstandingBalance, String paymentStatus) {
        this.studentId = studentId;
        this.admissionNumber = admissionNumber;
        this.studentName = studentName;
        this.classId = classId;
        this.className = className;
        this.feeStructureId = feeStructureId;
        this.feeType = feeType;
        this.term = term;
        this.totalFee = totalFee != null ? totalFee : 0.0;
        this.totalPaid = totalPaid != null ? totalPaid : 0.0;
        this.outstandingBalance = outstandingBalance != null ? outstandingBalance : Math.max(0.0, this.totalFee - this.totalPaid);
        this.paymentStatus = paymentStatus != null ? paymentStatus : ((this.totalPaid >= this.totalFee) ? "PAID" : ((this.totalPaid > 0) ? "PARTIAL" : "UNPAID"));
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

    public Long getClassId() {
        return classId;
    }

    public String getClassName() {
        return className;
    }

    public Long getFeeStructureId() {
        return feeStructureId;
    }

    public String getFeeType() {
        return feeType;
    }

    public String getTerm() {
        return term;
    }

    public Double getTotalFee() {
        return totalFee;
    }

    public Double getTotalPaid() {
        return totalPaid;
    }

    public Double getOutstandingBalance() {
        return outstandingBalance;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }
}
