package com.schoolsystem.backend.attendance.repository;

import com.schoolsystem.backend.attendance.model.TeacherAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherAttendanceRepository extends JpaRepository<TeacherAttendance, Long> {

    List<TeacherAttendance> findByDate(LocalDate date);

    Optional<TeacherAttendance> findByTeacherIdAndDate(Long teacherId, LocalDate date);

    List<TeacherAttendance> findByTeacherIdAndDateBetweenOrderByDateDesc(Long teacherId, LocalDate from, LocalDate to);

    long countByDateAndStatus(LocalDate date, String status);

    long countByDate(LocalDate date);
}
