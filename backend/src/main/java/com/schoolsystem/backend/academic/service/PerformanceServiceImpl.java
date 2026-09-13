package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.response.*;
import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.Grade;
import com.schoolsystem.backend.academic.model.Mark;
import com.schoolsystem.backend.academic.repository.ExamRepository;
import com.schoolsystem.backend.academic.repository.MarkRepository;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
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
public class PerformanceServiceImpl implements PerformanceService {

    private final MarkRepository markRepository;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final GradingService gradingService;

    public PerformanceServiceImpl(MarkRepository markRepository, ExamRepository examRepository,
                                  StudentRepository studentRepository, SchoolClassRepository schoolClassRepository,
                                  SubjectRepository subjectRepository, GradingService gradingService) {
        this.markRepository = markRepository;
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
        this.gradingService = gradingService;
    }

    @Override
    public StudentProgressTrendDTO getStudentProgressTrend(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId, "STUDENT_NOT_FOUND"));

        List<Mark> allStudentMarks = markRepository.findByStudentIdOrderByExamStartDateDesc(studentId);

        // Group by exam
        Map<Long, List<Mark>> byExam = allStudentMarks.stream()
                .collect(Collectors.groupingBy(m -> m.getExam().getId()));

        List<StudentTermTrendDTO> termTrends = new ArrayList<>();
        Map<String, List<Double>> subjectScoresHistory = new HashMap<>();

        for (Map.Entry<Long, List<Mark>> entry : byExam.entrySet()) {
            Long examId = entry.getKey();
            List<Mark> sMarks = entry.getValue();
            if (sMarks.isEmpty()) continue;

            Exam exam = sMarks.get(0).getExam();

            // Calculate class-wide ranking for this exam
            List<Mark> classMarks = markRepository.findByExamId(examId);
            Map<Long, Double> classAverages = new HashMap<>();
            for (Map.Entry<Long, List<Mark>> e : classMarks.stream().collect(Collectors.groupingBy(m -> m.getStudent().getId())).entrySet()) {
                double avg = e.getValue().stream().mapToDouble(Mark::getScore).sum() / e.getValue().size();
                classAverages.put(e.getKey(), avg);
            }
            Map<Long, Integer> classRanks = gradingService.calculateClassRankings(classAverages);

            double totalMarks = sMarks.stream().mapToDouble(Mark::getScore).sum();
            double avgScore = BigDecimal.valueOf(sMarks.stream().mapToDouble(Mark::getScore).average().orElse(0.0))
                    .setScale(2, RoundingMode.HALF_UP).doubleValue();

            Map<String, Double> subScores = new HashMap<>();
            for (Mark m : sMarks) {
                subScores.put(m.getSubject().getName(), m.getScore());
                subjectScoresHistory.computeIfAbsent(m.getSubject().getName(), k -> new ArrayList<>()).add(m.getScore());
            }

            StudentTermTrendDTO tDto = new StudentTermTrendDTO();
            tDto.setAcademicYear(exam.getAcademicYear());
            tDto.setTerm(exam.getTerm());
            tDto.setTermDisplayName(exam.getTerm() != null ? exam.getTerm().getDisplayName() : null);
            tDto.setExamId(exam.getId());
            tDto.setExamName(exam.getName());
            tDto.setAverageScore(avgScore);
            tDto.setClassRank(classRanks.getOrDefault(studentId, 1));
            tDto.setTotalStudentsInClass(classAverages.size());
            tDto.setTotalMarks(BigDecimal.valueOf(totalMarks).setScale(1, RoundingMode.HALF_UP).doubleValue());
            tDto.setOverallGrade(gradingService.calculateGrade(avgScore).name());
            tDto.setSubjectScores(subScores);

            termTrends.add(tDto);
        }

        // Sort term trends chronologically: Year ascending, then Term ordinal ascending
        termTrends.sort(Comparator.comparing(StudentTermTrendDTO::getAcademicYear)
                .thenComparing(t -> t.getTerm() != null ? t.getTerm().ordinal() : 0));

        // Determine trajectory
        String trajectory = "CONSISTENT";
        if (termTrends.size() >= 2) {
            double first = termTrends.get(0).getAverageScore();
            double last = termTrends.get(termTrends.size() - 1).getAverageScore();
            if (last - first >= 3.0) trajectory = "IMPROVING";
            else if (first - last >= 3.0) trajectory = "DECLINING";
        }

        // Determine strongest and weakest subjects
        String strongest = null;
        String weakest = null;
        double maxSubAvg = -1.0;
        double minSubAvg = 101.0;

        for (Map.Entry<String, List<Double>> entry : subjectScoresHistory.entrySet()) {
            double subAvg = entry.getValue().stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            if (subAvg > maxSubAvg) {
                maxSubAvg = subAvg;
                strongest = entry.getKey();
            }
            if (subAvg < minSubAvg) {
                minSubAvg = subAvg;
                weakest = entry.getKey();
            }
        }

        StudentProgressTrendDTO result = new StudentProgressTrendDTO();
        result.setStudentId(student.getId());
        result.setStudentName(student.getFullName());
        result.setAdmissionNumber(student.getAdmissionNumber());
        result.setCurrentClassName(student.getSchoolClass() != null ? student.getSchoolClass().getName() : "Grade Class");
        result.setTermTrends(termTrends);
        result.setProgressTrajectory(trajectory);
        result.setStrongestSubject(strongest != null ? strongest + " (" + String.format("%.1f", maxSubAvg) + "%)" : "N/A");
        result.setWeakestSubject(weakest != null ? weakest + " (" + String.format("%.1f", minSubAvg) + "%)" : "N/A");

        return result;
    }

    @Override
    public ClassPerformanceAnalyticsDTO getClassPerformanceAnalytics(Long classId, Long examId) {
        SchoolClass sc = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId, "CLASS_NOT_FOUND"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId, "EXAM_NOT_FOUND"));

        List<Mark> allMarks = markRepository.findByExamId(examId);

        // Group marks by student to compute overall student averages
        Map<Long, List<Mark>> byStudent = allMarks.stream().collect(Collectors.groupingBy(m -> m.getStudent().getId()));

        List<Double> studentAverages = new ArrayList<>();
        Map<String, Integer> overallGradeDist = new LinkedHashMap<>();
        overallGradeDist.put("A", 0);
        overallGradeDist.put("B", 0);
        overallGradeDist.put("C", 0);
        overallGradeDist.put("S", 0);
        overallGradeDist.put("F", 0);

        for (List<Mark> sMarks : byStudent.values()) {
            double avg = sMarks.stream().mapToDouble(Mark::getScore).sum() / sMarks.size();
            studentAverages.add(avg);
            Grade g = gradingService.calculateGrade(avg);
            overallGradeDist.put(g.name(), overallGradeDist.getOrDefault(g.name(), 0) + 1);
        }

        double overallClassAvg = studentAverages.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        double maxAvg = studentAverages.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
        double minAvg = studentAverages.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
        long passedStudents = studentAverages.stream().filter(a -> a >= 35.0).count();
        double passRate = studentAverages.isEmpty() ? 0.0 : ((double) passedStudents / studentAverages.size()) * 100.0;

        // Group marks by subject to compute subject performance
        Map<Long, List<Mark>> bySubject = allMarks.stream().collect(Collectors.groupingBy(m -> m.getSubject().getId()));
        List<SubjectPerformanceDTO> subjectDTOs = new ArrayList<>();

        for (Map.Entry<Long, List<Mark>> entry : bySubject.entrySet()) {
            List<Mark> subMarks = entry.getValue();
            if (subMarks.isEmpty()) continue;

            Subject sub = subMarks.get(0).getSubject();
            double subAvg = subMarks.stream().mapToDouble(Mark::getScore).average().orElse(0.0);
            double subMax = subMarks.stream().mapToDouble(Mark::getScore).max().orElse(0.0);
            double subMin = subMarks.stream().mapToDouble(Mark::getScore).min().orElse(0.0);
            long subPassed = subMarks.stream().filter(m -> m.getGrade() != null && m.getGrade().isPassing()).count();
            double subPassRate = ((double) subPassed / subMarks.size()) * 100.0;

            Map<String, Integer> subGradeDist = new LinkedHashMap<>();
            subGradeDist.put("A", 0);
            subGradeDist.put("B", 0);
            subGradeDist.put("C", 0);
            subGradeDist.put("S", 0);
            subGradeDist.put("F", 0);

            for (Mark m : subMarks) {
                if (m.getGrade() != null) {
                    subGradeDist.put(m.getGrade().name(), subGradeDist.getOrDefault(m.getGrade().name(), 0) + 1);
                }
            }

            SubjectPerformanceDTO sp = new SubjectPerformanceDTO();
            sp.setSubjectId(sub.getId());
            sp.setSubjectName(sub.getName());
            sp.setSubjectCode(sub.getCode());
            sp.setTotalStudents(subMarks.size());
            sp.setPassedStudents((int) subPassed);
            sp.setPassRate(BigDecimal.valueOf(subPassRate).setScale(1, RoundingMode.HALF_UP).doubleValue());
            sp.setAverageScore(BigDecimal.valueOf(subAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
            sp.setHighestScore(BigDecimal.valueOf(subMax).setScale(1, RoundingMode.HALF_UP).doubleValue());
            sp.setLowestScore(BigDecimal.valueOf(subMin).setScale(1, RoundingMode.HALF_UP).doubleValue());
            sp.setGradeDistribution(subGradeDist);

            subjectDTOs.add(sp);
        }

        subjectDTOs.sort(Comparator.comparing(SubjectPerformanceDTO::getSubjectName));

        ClassPerformanceAnalyticsDTO dto = new ClassPerformanceAnalyticsDTO();
        dto.setClassId(sc.getId());
        dto.setClassName(sc.getName());
        dto.setGradeLevel(sc.getGradeLevel());
        dto.setExamId(exam.getId());
        dto.setExamName(exam.getName());
        dto.setAcademicYear(exam.getAcademicYear());
        dto.setTerm(exam.getTerm());
        dto.setTermDisplayName(exam.getTerm() != null ? exam.getTerm().getDisplayName() : null);
        dto.setTotalStudents(studentAverages.size());
        dto.setOverallClassAverage(BigDecimal.valueOf(overallClassAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        dto.setHighestAverage(BigDecimal.valueOf(maxAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        dto.setLowestAverage(BigDecimal.valueOf(minAvg).setScale(2, RoundingMode.HALF_UP).doubleValue());
        dto.setOverallPassRate(BigDecimal.valueOf(passRate).setScale(1, RoundingMode.HALF_UP).doubleValue());
        dto.setOverallGradeDistribution(overallGradeDist);
        dto.setSubjectPerformances(subjectDTOs);

        return dto;
    }
}
