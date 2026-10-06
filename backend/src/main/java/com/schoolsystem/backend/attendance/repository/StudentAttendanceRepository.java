package com.schoolsystem.backend.attendance.repository;

import com.schoolsystem.backend.attendance.model.StudentAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAttendanceRepository extends JpaRepository<StudentAttendance, Long> {

    @Query("SELECT sa FROM StudentAttendance sa LEFT JOIN FETCH sa.student s LEFT JOIN FETCH sa.schoolClass sc LEFT JOIN FETCH sa.recordedBy WHERE sc.id = :classId AND sa.date = :date")
    List<StudentAttendance> findBySchoolClassIdAndDate(@Param("classId") Long classId, @Param("date") LocalDate date);

    Optional<StudentAttendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    @Query("SELECT sa FROM StudentAttendance sa LEFT JOIN FETCH sa.student s LEFT JOIN FETCH sa.schoolClass sc LEFT JOIN FETCH sa.recordedBy WHERE s.id = :studentId AND sa.date BETWEEN :from AND :to ORDER BY sa.date DESC")
    List<StudentAttendance> findByStudentIdAndDateBetweenOrderByDateDesc(@Param("studentId") Long studentId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT sa FROM StudentAttendance sa LEFT JOIN FETCH sa.student s LEFT JOIN FETCH sa.schoolClass sc LEFT JOIN FETCH sa.recordedBy WHERE sc.id = :classId AND sa.date BETWEEN :from AND :to ORDER BY sa.date DESC")
    List<StudentAttendance> findBySchoolClassIdAndDateBetweenOrderByDateDesc(@Param("classId") Long classId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    long countBySchoolClassIdAndDateAndStatus(Long classId, LocalDate date, String status);

    long countByDateAndStatus(LocalDate date, String status);

    long countByDate(LocalDate date);

    void deleteBySchoolClassIdAndDate(Long classId, LocalDate date);
}
