package com.schoolsystem.backend.attendance.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.attendance.dto.request.RecordStudentAttendanceRequest;
import com.schoolsystem.backend.attendance.dto.request.RecordTeacherAttendanceRequest;
import com.schoolsystem.backend.attendance.dto.response.AttendanceReportDTO;
import com.schoolsystem.backend.attendance.dto.response.StudentAttendanceDTO;
import com.schoolsystem.backend.attendance.dto.response.TeacherAttendanceDTO;
import com.schoolsystem.backend.attendance.model.StudentAttendance;
import com.schoolsystem.backend.attendance.model.TeacherAttendance;
import com.schoolsystem.backend.attendance.repository.StudentAttendanceRepository;
import com.schoolsystem.backend.attendance.repository.TeacherAttendanceRepository;
import com.schoolsystem.backend.common.exception.ResourceNotFoundException;
import com.schoolsystem.backend.student.model.Student;
import com.schoolsystem.backend.student.repository.StudentRepository;
import com.schoolsystem.backend.user.model.User;
import com.schoolsystem.backend.user.model.UserRole;
import com.schoolsystem.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolsystem.backend.attendance.strategy.AttendanceCalculationStrategy;
import com.schoolsystem.backend.attendance.strategy.StandardAttendanceStrategy;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final StudentAttendanceRepository studentAttendanceRepository;
    private final TeacherAttendanceRepository teacherAttendanceRepository;
    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final UserRepository userRepository;
    private AttendanceCalculationStrategy attendanceStrategy = new StandardAttendanceStrategy();

    public AttendanceServiceImpl(
            StudentAttendanceRepository studentAttendanceRepository,
            TeacherAttendanceRepository teacherAttendanceRepository,
            StudentRepository studentRepository,
            SchoolClassRepository schoolClassRepository,
            UserRepository userRepository
    ) {
        this.studentAttendanceRepository = studentAttendanceRepository;
        this.teacherAttendanceRepository = teacherAttendanceRepository;
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.userRepository = userRepository;
        this.attendanceStrategy = new StandardAttendanceStrategy();
    }

    @Autowired
    public AttendanceServiceImpl(
            StudentAttendanceRepository studentAttendanceRepository,
            TeacherAttendanceRepository teacherAttendanceRepository,
            StudentRepository studentRepository,
            SchoolClassRepository schoolClassRepository,
            UserRepository userRepository,
            @Autowired(required = false) AttendanceCalculationStrategy attendanceStrategy
    ) {
        this.studentAttendanceRepository = studentAttendanceRepository;
        this.teacherAttendanceRepository = teacherAttendanceRepository;
        this.studentRepository = studentRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.userRepository = userRepository;
        this.attendanceStrategy = (attendanceStrategy != null) ? attendanceStrategy : new StandardAttendanceStrategy();
    }

    public AttendanceCalculationStrategy getAttendanceStrategy() {
        return attendanceStrategy;
    }

    public void setAttendanceStrategy(AttendanceCalculationStrategy attendanceStrategy) {
        if (attendanceStrategy != null) {
            this.attendanceStrategy = attendanceStrategy;
        }
    }

    @Override
    @Transactional
    public List<StudentAttendanceDTO> recordStudentAttendance(RecordStudentAttendanceRequest request, String userClerkId) {
        SchoolClass schoolClass = schoolClassRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + request.getClassId()));

        User recorder = (userClerkId != null) ? userRepository.findByClerkId(userClerkId).orElse(null) : null;

        List<StudentAttendance> savedRecords = new ArrayList<>();

        for (RecordStudentAttendanceRequest.StudentAttendanceItem item : request.getRecords()) {
            if (item.getStatus() == null || item.getStatus().isBlank()) {
                throw new IllegalArgumentException("Attendance status is required for student id: " + item.getStudentId());
            }
            String statusUpper = item.getStatus().trim().toUpperCase();
            if (!List.of("PRESENT", "ABSENT", "LATE", "EXCUSED").contains(statusUpper)) {
                throw new IllegalArgumentException("Invalid attendance status: " + item.getStatus() + ". Must be PRESENT, ABSENT, LATE, or EXCUSED");
            }

            Student student = studentRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("STUDENT_NOT_FOUND", "Student not found with id: " + item.getStudentId()));

            Optional<StudentAttendance> existing = studentAttendanceRepository.findByStudentIdAndDate(student.getId(), request.getDate());

            StudentAttendance sa;
            if (existing.isPresent()) {
                sa = existing.get();
                sa.setStatus(statusUpper);
                sa.setRemarks(item.getRemarks());
                if (recorder != null) sa.setRecordedBy(recorder);
            } else {
                sa = new StudentAttendance(student, schoolClass, request.getDate(), statusUpper, item.getRemarks(), recorder);
            }
            savedRecords.add(studentAttendanceRepository.save(sa));
        }

        return savedRecords.stream().map(StudentAttendanceDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceDTO> getStudentAttendanceByClassAndDate(Long classId, LocalDate date) {
        return studentAttendanceRepository.findBySchoolClassIdAndDate(classId, date)
                .stream()
                .map(StudentAttendanceDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentAttendanceDTO> getStudentAttendanceHistory(Long studentId, Long classId, LocalDate from, LocalDate to) {
        LocalDate startDate = (from != null) ? from : LocalDate.now().minusMonths(1);
        LocalDate endDate = (to != null) ? to : LocalDate.now();

        if (studentId != null) {
            return studentAttendanceRepository.findByStudentIdAndDateBetweenOrderByDateDesc(studentId, startDate, endDate)
                    .stream().map(StudentAttendanceDTO::new).collect(Collectors.toList());
        } else if (classId != null) {
            return studentAttendanceRepository.findBySchoolClassIdAndDateBetweenOrderByDateDesc(classId, startDate, endDate)
                    .stream().map(StudentAttendanceDTO::new).collect(Collectors.toList());
        } else {
            return studentAttendanceRepository.findAll()
                    .stream().map(StudentAttendanceDTO::new).collect(Collectors.toList());
        }
    }

    @Override
    @Transactional
    public TeacherAttendanceDTO recordTeacherAttendance(RecordTeacherAttendanceRequest request, String userClerkId) {
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("TEACHER_NOT_FOUND", "Teacher not found with id: " + request.getTeacherId()));

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            throw new IllegalArgumentException("Attendance status is required");
        }
        String statusUpper = request.getStatus().trim().toUpperCase();
        if (!List.of("PRESENT", "ABSENT", "LATE", "ON_LEAVE").contains(statusUpper)) {
            throw new IllegalArgumentException("Invalid teacher attendance status: " + request.getStatus() + ". Must be PRESENT, ABSENT, LATE, or ON_LEAVE");
        }

        User recorder = (userClerkId != null) ? userRepository.findByClerkId(userClerkId).orElse(null) : null;

        Optional<TeacherAttendance> existing = teacherAttendanceRepository.findByTeacherIdAndDate(teacher.getId(), request.getDate());

        TeacherAttendance ta;
        if (existing.isPresent()) {
            ta = existing.get();
            ta.setStatus(statusUpper);
            ta.setCheckInTime(request.getCheckInTime());
            ta.setCheckOutTime(request.getCheckOutTime());
            ta.setNote(request.getNote());
            if (recorder != null) ta.setRecordedBy(recorder);
        } else {
            ta = new TeacherAttendance(teacher, request.getDate(), request.getCheckInTime(), request.getCheckOutTime(), statusUpper, request.getNote(), recorder);
        }

        TeacherAttendance saved = teacherAttendanceRepository.save(ta);
        return new TeacherAttendanceDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeacherAttendanceDTO> getTeacherAttendanceByDate(LocalDate date) {
        return teacherAttendanceRepository.findByDate(date)
                .stream()
                .map(TeacherAttendanceDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceReportDTO getAttendanceReport(LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        long totalStudents = studentRepository.count();
        long presentStudents = studentAttendanceRepository.countByDateAndStatus(targetDate, "PRESENT");
        long absentStudents = studentAttendanceRepository.countByDateAndStatus(targetDate, "ABSENT");
        long lateStudents = studentAttendanceRepository.countByDateAndStatus(targetDate, "LATE");

        long totalTeachers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.TEACHER)
                .count();
        long presentTeachers = teacherAttendanceRepository.countByDateAndStatus(targetDate, "PRESENT");

        // Strategy Pattern: delegate attendance rate calculations to the strategy
        double studentRate = attendanceStrategy.calculateAttendanceRate(presentStudents, totalStudents);
        double teacherRate = attendanceStrategy.calculateAttendanceRate(presentTeachers, totalTeachers);

        return new AttendanceReportDTO(
                targetDate,
                totalStudents,
                presentStudents,
                absentStudents,
                lateStudents,
                totalTeachers,
                presentTeachers
        );
    }

    @Override
    @Transactional
    public void clearClassAttendance(Long classId, LocalDate date) {
        if (classId == null || date == null) {
            throw new IllegalArgumentException("Class ID and date are mandatory to reset class attendance");
        }
        if (!schoolClassRepository.existsById(classId)) {
            throw new ResourceNotFoundException("CLASS_NOT_FOUND", "Class not found with id: " + classId);
        }
        studentAttendanceRepository.deleteBySchoolClassIdAndDate(classId, date);
    }
}
