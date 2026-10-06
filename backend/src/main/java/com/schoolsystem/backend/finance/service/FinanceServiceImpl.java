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
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolsystem.backend.finance.strategy.FeeCalculationStrategy;
import com.schoolsystem.backend.finance.strategy.FeeStrategyContext;
import com.schoolsystem.backend.finance.strategy.StandardFeeCalculationStrategy;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinanceServiceImpl implements FinanceService {

    private final FeeStructureRepository feeStructureRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final UserRepository userRepository;
    private FeeCalculationStrategy feeCalculationStrategy = new StandardFeeCalculationStrategy();

    public FinanceServiceImpl(
            FeeStructureRepository feeStructureRepository,
            PaymentRepository paymentRepository,
            StudentRepository studentRepository,
            SchoolClassRepository schoolClassRepository,
            UserRepository userRepository
    ) {
        this.feeStructureRepository = feeStructureRepository;
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.userRepository = userRepository;
        this.feeCalculationStrategy = new StandardFeeCalculationStrategy();
    }

    @Autowired
    public FinanceServiceImpl(
            FeeStructureRepository feeStructureRepository,
            PaymentRepository paymentRepository,
            StudentRepository studentRepository,
            SchoolClassRepository schoolClassRepository,
            UserRepository userRepository,
            @Autowired(required = false) FeeStrategyContext feeStrategyContext
    ) {
        this.feeStructureRepository = feeStructureRepository;
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.userRepository = userRepository;
        this.feeCalculationStrategy = (feeStrategyContext != null)
                ? feeStrategyContext.getActiveStrategy()
                : new StandardFeeCalculationStrategy();
    }

    public FeeCalculationStrategy getFeeCalculationStrategy() {
        return feeCalculationStrategy;
    }

    public void setFeeCalculationStrategy(FeeCalculationStrategy feeCalculationStrategy) {
        if (feeCalculationStrategy != null) {
            this.feeCalculationStrategy = feeCalculationStrategy;
        }
    }

    @Override
    @Transactional
    public FeeStructureDTO createFeeStructure(FeeStructureRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("Fee amount must be greater than zero");
        }

        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + request.getClassId()));

        FeeStructure fs = new FeeStructure(
                schoolClass,
                request.getTerm(),
                request.getAcademicYear(),
                request.getFeeType(),
                request.getAmount(),
                request.getDueDate()
        );

        FeeStructure saved = feeStructureRepository.save(fs);
        return new FeeStructureDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeStructureDTO> getFeeStructures(Long classId, Integer academicYear) {
        List<FeeStructure> list;
        if (classId != null) {
            list = feeStructureRepository.findBySchoolClassId(classId);
        } else if (academicYear != null) {
            list = feeStructureRepository.findByAcademicYear(academicYear);
        } else {
            list = feeStructureRepository.findAll();
        }
        return list.stream().map(FeeStructureDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteFeeStructure(Long id) {
        FeeStructure fs = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FEE_STRUCTURE_NOT_FOUND", "Fee structure not found with id: " + id));

        List<Payment> payments = paymentRepository.findByFeeStructureId(id);
        if (payments != null && !payments.isEmpty()) {
            paymentRepository.deleteAll(payments);
        }

        feeStructureRepository.delete(fs);
    }

    @Override
    @Transactional
    public FeeStructureDTO updateFeeStructure(Long id, FeeStructureRequest request) {
        FeeStructure fs = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FEE_STRUCTURE_NOT_FOUND", "Fee structure not found with id: " + id));

        if (request.getAmount() != null && request.getAmount() <= 0) {
            throw new IllegalArgumentException("Fee amount must be greater than zero");
        }

        if (request.getClassId() != null) {
            SchoolClass sc = schoolClassRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + request.getClassId()));
            fs.setSchoolClass(sc);
        }
        if (request.getTerm() != null) fs.setTerm(request.getTerm());
        if (request.getAcademicYear() != null) fs.setAcademicYear(request.getAcademicYear());
        if (request.getFeeType() != null) fs.setFeeType(request.getFeeType());
        if (request.getAmount() != null) fs.setAmount(request.getAmount());
        if (request.getDueDate() != null) fs.setDueDate(request.getDueDate());

        FeeStructure saved = feeStructureRepository.save(fs);
        return new FeeStructureDTO(saved);
    }

    @Override
    @Transactional
    public PaymentReceiptDTO recordPayment(RecordPaymentRequest request, String userClerkId) {
        if (request.getAmountPaid() == null || request.getAmountPaid() <= 0) {
            throw new IllegalArgumentException("Amount paid must be greater than zero");
        }

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("STUDENT_NOT_FOUND", "Student not found with id: " + request.getStudentId()));

        FeeStructure feeStructure = feeStructureRepository.findById(request.getFeeStructureId())
                .orElseThrow(() -> new ResourceNotFoundException("FEE_STRUCTURE_NOT_FOUND", "Fee structure not found with id: " + request.getFeeStructureId()));

        User recorder = (userClerkId != null) ? userRepository.findByClerkId(userClerkId).orElse(null) : null;

        int year = LocalDate.now().getYear();
        long count = paymentRepository.count() + 1;
        String receiptNumber = String.format("REC-%d-%05d", year, count);
        while (paymentRepository.findByReceiptNumber(receiptNumber).isPresent()) {
            count++;
            receiptNumber = String.format("REC-%d-%05d", year, count);
        }

        LocalDate pDate = (request.getPaymentDate() != null) ? request.getPaymentDate() : LocalDate.now();

        Payment payment = new Payment(
                receiptNumber,
                student,
                feeStructure,
                request.getAmountPaid(),
                pDate,
                request.getPaymentMethod().toUpperCase(),
                request.getRemarks(),
                recorder
        );

        Payment saved = paymentRepository.save(payment);
        Double totalPaid = paymentRepository.getTotalPaidByStudentAndFeeStructure(student.getId(), feeStructure.getId());

        return new PaymentReceiptDTO(saved, feeStructure.getAmount(), totalPaid);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentReceiptDTO> getPaymentsByStudent(Long studentId) {
        List<Payment> payments = paymentRepository.findByStudentIdWithDetails(studentId);
        return payments.stream()
                .map(p -> {
                    Double totalFee = (p.getFeeStructure() != null) ? p.getFeeStructure().getAmount() : 0.0;
                    Double totalPaid = (p.getFeeStructure() != null)
                            ? paymentRepository.getTotalPaidByStudentAndFeeStructure(studentId, p.getFeeStructure().getId())
                            : p.getAmountPaid();
                    return new PaymentReceiptDTO(p, totalFee, totalPaid);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentReceiptDTO> getAllPayments() {
        List<Payment> payments = paymentRepository.findAllWithDetails();

        Map<String, Double> paidMap = new HashMap<>();
        List<Object[]> paidRows = paymentRepository.getAggregatedPaidPerStudentAndFeeStructure();
        for (Object[] row : paidRows) {
            if (row != null && row.length >= 3 && row[0] != null && row[1] != null) {
                Long sId = ((Number) row[0]).longValue();
                Long fsId = ((Number) row[1]).longValue();
                Double amt = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
                paidMap.put(sId + "_" + fsId, amt);
            }
        }

        return payments.stream()
                .map(p -> {
                    Double totalFee = (p.getFeeStructure() != null) ? p.getFeeStructure().getAmount() : 0.0;
                    Long sId = (p.getStudent() != null) ? p.getStudent().getId() : null;
                    Long fsId = (p.getFeeStructure() != null) ? p.getFeeStructure().getId() : null;
                    Double totalPaid = (sId != null && fsId != null) ? paidMap.getOrDefault(sId + "_" + fsId, p.getAmountPaid()) : p.getAmountPaid();
                    return new PaymentReceiptDTO(p, totalFee, totalPaid);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OutstandingBalanceDTO> getOutstandingPayments(Long classId) {
        List<Student> students = (classId != null)
                ? studentRepository.findBySchoolClassIdOrderByLastNameAscFirstNameAsc(classId)
                : studentRepository.findAll();

        List<FeeStructure> feeStructures = (classId != null)
                ? feeStructureRepository.findBySchoolClassId(classId)
                : feeStructureRepository.findAll();

        Map<Long, List<FeeStructure>> feesByClassId = feeStructures.stream()
                .filter(fs -> fs.getSchoolClass() != null)
                .collect(Collectors.groupingBy(fs -> fs.getSchoolClass().getId()));

        Map<String, Double> paidMap = new HashMap<>();
        List<Object[]> paidRows = paymentRepository.getAggregatedPaidPerStudentAndFeeStructure();
        for (Object[] row : paidRows) {
            if (row != null && row.length >= 3 && row[0] != null && row[1] != null) {
                Long sId = ((Number) row[0]).longValue();
                Long fsId = ((Number) row[1]).longValue();
                Double amt = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
                paidMap.put(sId + "_" + fsId, amt);
            }
        }

        List<OutstandingBalanceDTO> result = new ArrayList<>();

        for (Student student : students) {
            if (student.getSchoolClass() == null) continue;

            List<FeeStructure> applicableFees = feesByClassId.get(student.getSchoolClass().getId());
            if (applicableFees == null || applicableFees.isEmpty()) continue;

            for (FeeStructure fs : applicableFees) {
                String key = student.getId() + "_" + fs.getId();
                Double totalPaid = paidMap.containsKey(key)
                        ? paidMap.get(key)
                        : paymentRepository.getTotalPaidByStudentAndFeeStructure(student.getId(), fs.getId());
                if (totalPaid == null) totalPaid = 0.0;

                // Strategy Pattern: delegate fee adjustment, outstanding balance, and status determination
                Double totalFee = feeCalculationStrategy.calculateAdjustedFee(fs.getAmount(), fs.getDueDate());
                Double outstandingBalance = feeCalculationStrategy.calculateOutstanding(totalFee, totalPaid);
                String paymentStatus = feeCalculationStrategy.determinePaymentStatus(totalFee, totalPaid);

                OutstandingBalanceDTO dto = new OutstandingBalanceDTO(
                        student.getId(),
                        student.getAdmissionNumber(),
                        student.getFullName(),
                        student.getSchoolClass().getId(),
                        student.getSchoolClass().getName(),
                        fs.getId(),
                        fs.getFeeType(),
                        fs.getTerm(),
                        totalFee,
                        totalPaid,
                        outstandingBalance,
                        paymentStatus
                );
                result.add(dto);
            }
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialReportDTO getFinancialReport() {
        Double totalCollected = paymentRepository.getTotalCollections();
        if (totalCollected == null) totalCollected = 0.0;

        List<OutstandingBalanceDTO> outstandingList = getOutstandingPayments(null);
        Double totalOutstanding = outstandingList.stream()
                .mapToDouble(OutstandingBalanceDTO::getOutstandingBalance)
                .sum();

        long totalTransactions = paymentRepository.count();

        Map<String, Double> termBreakdown = new HashMap<>();
        List<Payment> allPayments = paymentRepository.findAllWithDetails();
        for (Payment p : allPayments) {
            String term = (p.getFeeStructure() != null && p.getFeeStructure().getTerm() != null)
                    ? p.getFeeStructure().getTerm()
                    : "Other";
            termBreakdown.put(term, termBreakdown.getOrDefault(term, 0.0) + p.getAmountPaid());
        }

        return new FinancialReportDTO(totalCollected, totalOutstanding, totalTransactions, termBreakdown);
    }
}
