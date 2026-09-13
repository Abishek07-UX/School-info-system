package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.response.*;
import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamTerm;
import com.schoolsystem.backend.academic.model.Grade;
import com.schoolsystem.backend.academic.model.Mark;
import com.schoolsystem.backend.academic.repository.ExamRepository;
import com.schoolsystem.backend.academic.repository.MarkRepository;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.student.model.Student;
import com.schoolsystem.backend.student.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportCardServiceImpl implements ReportCardService {

    private final MarkRepository markRepository;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final GradingService gradingService;

    public ReportCardServiceImpl(MarkRepository markRepository, ExamRepository examRepository,
                                 StudentRepository studentRepository, SchoolClassRepository schoolClassRepository,
                                 GradingService gradingService) {
        this.markRepository = markRepository;
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.gradingService = gradingService;
    }

    @Override
    public ReportCardDTO generateReportCard(Long studentId, Long examId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId, "STUDENT_NOT_FOUND"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId, "EXAM_NOT_FOUND"));

        // Get all marks for this class in this exam to compute accurate class-wide rankings
        List<Mark> allClassMarks = markRepository.findByExamId(examId);

        // Group marks by student
        Map<Long, List<Mark>> marksByStudent = allClassMarks.stream()
                .collect(Collectors.groupingBy(m -> m.getStudent().getId()));

        // Compute averages for all students who took this exam
        Map<Long, Double> studentAverages = new HashMap<>();
        for (Map.Entry<Long, List<Mark>> entry : marksByStudent.entrySet()) {
            double sum = entry.getValue().stream().mapToDouble(Mark::getScore).sum();
            double avg = entry.getValue().isEmpty() ? 0.0 : sum / entry.getValue().size();
            studentAverages.put(entry.getKey(), BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        }

        // Calculate dynamic class rankings
        Map<Long, Integer> classRankings = gradingService.calculateClassRankings(studentAverages);

        // Extract the target student's marks
        List<Mark> studentMarks = marksByStudent.getOrDefault(studentId, Collections.emptyList());

        List<SubjectMarkDetailDTO> subjectDetails = studentMarks.stream()
                .map(m -> new SubjectMarkDetailDTO(
                        m.getSubject().getId(),
                        m.getSubject().getName(),
                        m.getSubject().getCode(),
                        m.getScore(),
                        m.getGrade(),
                        m.getGrade() != null ? m.getGrade().getDescription() : null,
                        m.getGrade() != null && m.getGrade().isPassing(),
                        m.getRemarks(),
                        m.getRecordedBy() != null ? m.getRecordedBy().getFullName() : null
                ))
                .collect(Collectors.toList());

        int totalSubjects = subjectDetails.size();
        int passedSubjects = (int) subjectDetails.stream().filter(SubjectMarkDetailDTO::isPassing).count();
        int failedSubjects = totalSubjects - passedSubjects;
        double totalMarks = studentMarks.stream().mapToDouble(Mark::getScore).sum();
        double averageScore = studentAverages.getOrDefault(studentId, 0.0);
        Integer classRank = classRankings.get(studentId);
        int totalStudentsInClass = studentAverages.size();

        ReportCardDTO dto = new ReportCardDTO();
        dto.setStudentId(student.getId());
        dto.setStudentName(student.getFullName());
        dto.setAdmissionNumber(student.getAdmissionNumber());
        dto.setGender(student.getGender());

        if (exam.getSchoolClass() != null) {
            SchoolClass sc = exam.getSchoolClass();
            dto.setClassId(sc.getId());
            dto.setClassName(sc.getName());
            dto.setGradeLevel(sc.getGradeLevel());
            if (sc.getClassTeacher() != null) {
                dto.setClassTeacherName(sc.getClassTeacher().getFullName());
            }
        }
        if (student.getSection() != null) {
            dto.setSectionName(student.getSection().getName());
        }

        dto.setExamId(exam.getId());
        dto.setExamName(exam.getName());
        dto.setAcademicYear(exam.getAcademicYear());
        dto.setTerm(exam.getTerm());
        dto.setTermDisplayName(exam.getTerm() != null ? exam.getTerm().getDisplayName() : null);

        dto.setSubjectMarks(subjectDetails);
        dto.setTotalSubjects(totalSubjects);
        dto.setPassedSubjects(passedSubjects);
        dto.setFailedSubjects(failedSubjects);
        dto.setTotalMarks(BigDecimal.valueOf(totalMarks).setScale(1, RoundingMode.HALF_UP).doubleValue());
        dto.setMaxPossibleMarks((double) (totalSubjects * 100));
        dto.setAverageScore(averageScore);
        dto.setClassRank(classRank != null ? classRank : 0);
        dto.setTotalStudentsInClass(totalStudentsInClass > 0 ? totalStudentsInClass : 1);
        dto.setPassedOverall("PASS".equals(gradingService.determineOverallPassingStatus(averageScore, failedSubjects)));
        dto.setOverallGrade(gradingService.calculateGrade(averageScore).name());

        // Construct a contextual principal remark
        if (classRank != null && classRank == 1) {
            dto.setPrincipalRemarks("Outstanding achievement! Ranked 1st in the class. Exemplary dedication and academic excellence.");
        } else if (averageScore >= 75.0) {
            dto.setPrincipalRemarks("Excellent academic performance. Consistently maintains high standards across all subjects.");
        } else if (averageScore >= 65.0) {
            dto.setPrincipalRemarks("Very good term result. With continued focus, has potential to reach top distinctions.");
        } else if (averageScore >= 50.0) {
            dto.setPrincipalRemarks("Satisfactory progress. Regular practice and focused revision recommended for upcoming term.");
        } else {
            dto.setPrincipalRemarks("Academic improvement required. Recommended for additional teacher guidance and structured study hours.");
        }

        return dto;
    }

    @Override
    public AnnualProgressDTO generateAnnualProgress(Long studentId, Integer academicYear, Long classId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId, "STUDENT_NOT_FOUND"));

        Long targetClassId = classId != null ? classId : (student.getSchoolClass() != null ? student.getSchoolClass().getId() : 1L);
        SchoolClass sc = schoolClassRepository.findById(targetClassId).orElse(null);

        // Find all exams for this class in the academic year
        List<Exam> yearExams = examRepository.findBySchoolClassIdAndAcademicYearOrderByTermAsc(targetClassId, academicYear);

        Map<ExamTerm, Exam> examByTerm = yearExams.stream()
                .collect(Collectors.toMap(Exam::getTerm, e -> e, (e1, e2) -> e1));

        TermSummaryDTO t1Summary = buildTermSummary(studentId, examByTerm.get(ExamTerm.TERM_1));
        TermSummaryDTO t2Summary = buildTermSummary(studentId, examByTerm.get(ExamTerm.TERM_2));
        TermSummaryDTO t3Summary = buildTermSummary(studentId, examByTerm.get(ExamTerm.TERM_3));

        // Calculate Annual Cumulative Average
        List<Double> validAverages = new ArrayList<>();
        if (t1Summary != null && t1Summary.isAvailable()) validAverages.add(t1Summary.getAverageScore());
        if (t2Summary != null && t2Summary.isAvailable()) validAverages.add(t2Summary.getAverageScore());
        if (t3Summary != null && t3Summary.isAvailable()) validAverages.add(t3Summary.getAverageScore());

        double annualAvg = validAverages.isEmpty() ? 0.0 : validAverages.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        annualAvg = BigDecimal.valueOf(annualAvg).setScale(2, RoundingMode.HALF_UP).doubleValue();

        // Calculate Annual Rank among all students in class
        Integer annualRank = calculateAnnualClassRank(studentId, targetClassId, academicYear);

        AnnualProgressDTO dto = new AnnualProgressDTO();
        dto.setStudentId(student.getId());
        dto.setStudentName(student.getFullName());
        dto.setAdmissionNumber(student.getAdmissionNumber());
        dto.setClassId(targetClassId);
        dto.setClassName(sc != null ? sc.getName() : "Grade Class");
        dto.setAcademicYear(academicYear);
        dto.setTerm1(t1Summary);
        dto.setTerm2(t2Summary);
        dto.setTerm3(t3Summary);
        dto.setAnnualAverage(annualAvg);
        dto.setAnnualRank(annualRank);
        dto.setTotalStudentsInClass(t1Summary != null && t1Summary.getTotalStudents() > 0 ? t1Summary.getTotalStudents() : 35);
        dto.setOverallGrade(gradingService.calculateGrade(annualAvg).name());
        dto.setAnnualStatus(annualAvg >= 35.0 ? "PROMOTED" : "RETAINED");

        return dto;
    }

    private TermSummaryDTO buildTermSummary(Long studentId, Exam exam) {
        if (exam == null) {
            return new TermSummaryDTO(null, null, null, null, 0.0, 0.0, 0, 0, 0, 0, "N/A", false);
        }

        List<Mark> examMarks = markRepository.findByExamId(exam.getId());
        if (examMarks.isEmpty()) {
            return new TermSummaryDTO(exam.getTerm(), exam.getTerm().getDisplayName(), exam.getId(), exam.getName(),
                    0.0, 0.0, 0, 0, 0, 0, "N/A", false);
        }

        Map<Long, List<Mark>> byStudent = examMarks.stream().collect(Collectors.groupingBy(m -> m.getStudent().getId()));
        Map<Long, Double> averages = new HashMap<>();
        for (Map.Entry<Long, List<Mark>> e : byStudent.entrySet()) {
            double sum = e.getValue().stream().mapToDouble(Mark::getScore).sum();
            double avg = sum / e.getValue().size();
            averages.put(e.getKey(), BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        }

        Map<Long, Integer> ranks = gradingService.calculateClassRankings(averages);
        List<Mark> sMarks = byStudent.getOrDefault(studentId, Collections.emptyList());

        if (sMarks.isEmpty()) {
            return new TermSummaryDTO(exam.getTerm(), exam.getTerm().getDisplayName(), exam.getId(), exam.getName(),
                    0.0, 0.0, 0, averages.size(), 0, 0, "N/A", false);
        }

        double total = sMarks.stream().mapToDouble(Mark::getScore).sum();
        double avg = averages.getOrDefault(studentId, 0.0);
        int rank = ranks.getOrDefault(studentId, 0);
        int passed = (int) sMarks.stream().filter(m -> m.getGrade() != null && m.getGrade().isPassing()).count();

        return new TermSummaryDTO(
                exam.getTerm(),
                exam.getTerm().getDisplayName(),
                exam.getId(),
                exam.getName(),
                BigDecimal.valueOf(total).setScale(1, RoundingMode.HALF_UP).doubleValue(),
                avg,
                rank,
                averages.size(),
                sMarks.size(),
                passed,
                gradingService.calculateGrade(avg).name(),
                true
        );
    }

    private Integer calculateAnnualClassRank(Long studentId, Long classId, Integer academicYear) {
        List<Exam> exams = examRepository.findBySchoolClassIdAndAcademicYearOrderByTermAsc(classId, academicYear);
        if (exams.isEmpty()) return 1;

        Map<Long, List<Double>> studentTermAverages = new HashMap<>();

        for (Exam ex : exams) {
            List<Mark> marks = markRepository.findByExamId(ex.getId());
            Map<Long, List<Mark>> byStudent = marks.stream().collect(Collectors.groupingBy(m -> m.getStudent().getId()));
            for (Map.Entry<Long, List<Mark>> entry : byStudent.entrySet()) {
                double avg = entry.getValue().stream().mapToDouble(Mark::getScore).sum() / entry.getValue().size();
                studentTermAverages.computeIfAbsent(entry.getKey(), k -> new ArrayList<>()).add(avg);
            }
        }

        Map<Long, Double> annualAverages = new HashMap<>();
        for (Map.Entry<Long, List<Double>> e : studentTermAverages.entrySet()) {
            double cumulativeAvg = e.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            annualAverages.put(e.getKey(), BigDecimal.valueOf(cumulativeAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        }

        Map<Long, Integer> annualRanks = gradingService.calculateClassRankings(annualAverages);
        return annualRanks.getOrDefault(studentId, 1);
    }

    @Override
    public ClassLeaderboardDTO generateClassLeaderboard(Long classId, Long examId) {
        SchoolClass sc = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId, "CLASS_NOT_FOUND"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId, "EXAM_NOT_FOUND"));

        List<Mark> allMarks = markRepository.findByExamId(examId);
        Map<Long, List<Mark>> marksByStudent = allMarks.stream().collect(Collectors.groupingBy(m -> m.getStudent().getId()));

        Map<Long, Double> averages = new HashMap<>();
        Map<Long, Double> totals = new HashMap<>();
        Map<Long, Student> studentEntityMap = new HashMap<>();

        for (Map.Entry<Long, List<Mark>> entry : marksByStudent.entrySet()) {
            double sum = entry.getValue().stream().mapToDouble(Mark::getScore).sum();
            double avg = entry.getValue().isEmpty() ? 0.0 : sum / entry.getValue().size();
            averages.put(entry.getKey(), BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP).doubleValue());
            totals.put(entry.getKey(), BigDecimal.valueOf(sum).setScale(1, RoundingMode.HALF_UP).doubleValue());
            studentEntityMap.put(entry.getKey(), entry.getValue().get(0).getStudent());
        }

        Map<Long, Integer> ranks = gradingService.calculateClassRankings(averages);

        List<ClassLeaderboardItemDTO> items = new ArrayList<>();
        for (Map.Entry<Long, Double> entry : averages.entrySet()) {
            Long sId = entry.getKey();
            Double avg = entry.getValue();
            Double total = totals.getOrDefault(sId, 0.0);
            Integer rank = ranks.getOrDefault(sId, 0);
            Student s = studentEntityMap.get(sId);
            List<Mark> sMarks = marksByStudent.getOrDefault(sId, Collections.emptyList());
            int totalSubs = sMarks.size();
            int passedSubs = (int) sMarks.stream().filter(m -> m.getGrade() != null && m.getGrade().isPassing()).count();
            boolean passedOverall = "PASS".equals(gradingService.determineOverallPassingStatus(avg, totalSubs - passedSubs));

            items.add(new ClassLeaderboardItemDTO(
                    rank,
                    sId,
                    s != null ? s.getFullName() : "Student #" + sId,
                    s != null ? s.getAdmissionNumber() : "STD-" + sId,
                    total,
                    avg,
                    gradingService.calculateGrade(avg).name(),
                    totalSubs,
                    passedSubs,
                    passedOverall
            ));
        }

        // Sort by rank ascending, then by average descending
        items.sort(Comparator.comparing(ClassLeaderboardItemDTO::getRank)
                .thenComparing((i1, i2) -> Double.compare(i2.getAverageScore(), i1.getAverageScore())));

        double classAvg = averages.values().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double maxAvg = averages.values().stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        double minAvg = averages.values().stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        long passedCount = items.stream().filter(ClassLeaderboardItemDTO::isPassedOverall).count();
        double passRate = items.isEmpty() ? 0.0 : ((double) passedCount / items.size()) * 100.0;

        ClassLeaderboardDTO dto = new ClassLeaderboardDTO();
        dto.setClassId(sc.getId());
        dto.setClassName(sc.getName());
        dto.setGradeLevel(sc.getGradeLevel());
        dto.setExamId(exam.getId());
        dto.setExamName(exam.getName());
        dto.setAcademicYear(exam.getAcademicYear());
        dto.setTerm(exam.getTerm());
        dto.setTermDisplayName(exam.getTerm() != null ? exam.getTerm().getDisplayName() : null);
        dto.setTotalStudents(items.size());
        dto.setClassAverage(BigDecimal.valueOf(classAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        dto.setHighestAverage(BigDecimal.valueOf(maxAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        dto.setLowestAverage(BigDecimal.valueOf(minAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        dto.setTotalPassed((int) passedCount);
        dto.setPassRate(BigDecimal.valueOf(passRate).setScale(1, RoundingMode.HALF_UP).doubleValue());
        dto.setRankings(items);

        return dto;
    }
}
