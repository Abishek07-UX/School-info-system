package com.schoolsystem.backend.academic.service;

import com.schoolsystem.backend.academic.dto.request.BatchMarkEntryRequest;
import com.schoolsystem.backend.academic.dto.request.EnterMarkRequest;
import com.schoolsystem.backend.academic.dto.request.MarkItemDTO;
import com.schoolsystem.backend.academic.dto.response.BatchMarkResponseDTO;
import com.schoolsystem.backend.academic.dto.response.MarkResponseDTO;
import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.Grade;
import com.schoolsystem.backend.academic.model.Mark;
import com.schoolsystem.backend.academic.repository.ExamRepository;
import com.schoolsystem.backend.academic.repository.MarkRepository;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.student.model.Student;
import com.schoolsystem.backend.student.repository.StudentRepository;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.model.UserRole;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MarkServiceImpl implements MarkService {

    private final MarkRepository markRepository;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final GradingService gradingService;

    public MarkServiceImpl(MarkRepository markRepository, ExamRepository examRepository,
                           StudentRepository studentRepository, SubjectRepository subjectRepository,
                           UserRepository userRepository, GradingService gradingService) {
        this.markRepository = markRepository;
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.gradingService = gradingService;
    }

    @Override
    public MarkResponseDTO enterSingleMark(EnterMarkRequest request, Long recordedByUserId) {
        User recordedBy = requireEditor(recordedByUserId);
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId(), "EXAM_NOT_FOUND"));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId(), "STUDENT_NOT_FOUND"));

        requirePermissionForStudent(recordedBy, exam, student);

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId(), "SUBJECT_NOT_FOUND"));

        // Check if a mark already exists for this (exam, student, subject)
        Optional<Mark> existingMark = markRepository.findByExamIdAndStudentIdAndSubjectId(
                request.getExamId(), request.getStudentId(), request.getSubjectId());

        Mark mark;
        if (existingMark.isPresent()) {
            mark = existingMark.get();
            mark.setScore(request.getScore());
            mark.setGrade(gradingService.calculateGrade(request.getScore()));
            mark.setRemarks(request.getRemarks());
            mark.setRecordedBy(recordedBy);
        } else {
            mark = new Mark(exam, student, subject, request.getScore(), request.getRemarks(), recordedBy);
        }

        Mark saved = markRepository.save(mark);
        return MarkResponseDTO.fromEntity(saved);
    }

    @Override
    public BatchMarkResponseDTO enterBatchMarks(BatchMarkEntryRequest request, Long recordedByUserId) {
        User recordedBy = requireEditor(recordedByUserId);
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId(), "EXAM_NOT_FOUND"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId(), "SUBJECT_NOT_FOUND"));

        List<Long> studentIds = request.getMarks().stream().map(MarkItemDTO::getStudentId).distinct().toList();
        Map<Long, Student> studentsById = studentRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(Student::getId, student -> student));

        // Validate the entire batch before changing any mark.
        for (MarkItemDTO item : request.getMarks()) {
            Student student = studentsById.get(item.getStudentId());
            if (student == null) {
                throw new ResourceNotFoundException("Student not found with id: " + item.getStudentId(), "STUDENT_NOT_FOUND");
            }
            requirePermissionForStudent(recordedBy, exam, student);
        }

        List<MarkResponseDTO> savedDTOs = new ArrayList<>();

        for (MarkItemDTO item : request.getMarks()) {
            Student student = studentsById.get(item.getStudentId());

            Optional<Mark> existingMark = markRepository.findByExamIdAndStudentIdAndSubjectId(
                    request.getExamId(), item.getStudentId(), request.getSubjectId());

            Mark mark;
            if (existingMark.isPresent()) {
                mark = existingMark.get();
                mark.setScore(item.getScore());
                mark.setGrade(gradingService.calculateGrade(item.getScore()));
                mark.setRemarks(item.getRemarks());
                mark.setRecordedBy(recordedBy);
            } else {
                mark = new Mark(exam, student, subject, item.getScore(), item.getRemarks(), recordedBy);
            }

            Mark saved = markRepository.save(mark);
            savedDTOs.add(MarkResponseDTO.fromEntity(saved));
        }

        return new BatchMarkResponseDTO(
                exam.getId(),
                exam.getName(),
                subject.getId(),
                subject.getName(),
                savedDTOs.size(),
                savedDTOs
        );
    }

    private User requireEditor(Long userId) {
        if (userId == null) throw new AccessDeniedException("Sign in to edit marks");
        return userRepository.findById(userId)
                .orElseThrow(() -> new AccessDeniedException("Sign in to edit marks"));
    }

    private void requirePermissionForStudent(User editor, Exam exam, Student student) {
        SchoolClass studentClass = student.getSchoolClass();
        SchoolClass examClass = exam.getSchoolClass();
        if (examClass != null && (studentClass == null || !Objects.equals(examClass.getId(), studentClass.getId()))) {
            throw new IllegalArgumentException("Student is not enrolled in the exam's class");
        }

        if (editor.getRole() == UserRole.ADMIN) return;
        if (editor.getRole() != UserRole.TEACHER || studentClass == null ||
                studentClass.getClassTeacher() == null ||
                !Objects.equals(studentClass.getClassTeacher().getId(), editor.getId())) {
            throw new AccessDeniedException("Only the assigned class teacher can edit these marks");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarkResponseDTO> getMarksForExamAndSubject(Long examId, Long subjectId) {
        List<Mark> marks = markRepository.findByExamIdAndSubjectId(examId, subjectId);
        return marks.stream().map(MarkResponseDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarkResponseDTO> getMarksForExamAndStudent(Long examId, Long studentId) {
        List<Mark> marks = markRepository.findByExamIdAndStudentId(examId, studentId);
        return marks.stream().map(MarkResponseDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarkResponseDTO> getMarksForExam(Long examId) {
        List<Mark> marks = markRepository.findByExamId(examId);
        return marks.stream().map(MarkResponseDTO::fromEntity).collect(Collectors.toList());
    }

    @Override
    public void deleteMark(Long id) {
        if (!markRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mark not found with id: " + id, "MARK_NOT_FOUND");
        }
        markRepository.deleteById(id);
    }
}
