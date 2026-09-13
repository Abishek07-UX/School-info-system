package com.schoolsystem.backend.timetable.repository;

import com.schoolsystem.backend.timetable.model.ExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamScheduleRepository extends JpaRepository<ExamSchedule, Long> {

    List<ExamSchedule> findByExamId(Long examId);

    List<ExamSchedule> findBySchoolClassIdAndExamId(Long classId, Long examId);

    List<ExamSchedule> findByInvigilatorId(Long invigilatorId);

    List<ExamSchedule> findByExamDate(LocalDate examDate);

    @Query("SELECT s FROM ExamSchedule s " +
           "JOIN FETCH s.exam " +
           "JOIN FETCH s.schoolClass " +
           "JOIN FETCH s.subject " +
           "JOIN FETCH s.invigilator " +
           "LEFT JOIN FETCH s.coInvigilator " +
           "WHERE s.exam.id = :examId " +
           "ORDER BY s.examDate, s.startTime")
    List<ExamSchedule> findByExamIdWithDetails(@Param("examId") Long examId);

    @Query("SELECT s FROM ExamSchedule s " +
           "JOIN FETCH s.exam " +
           "JOIN FETCH s.schoolClass " +
           "JOIN FETCH s.subject " +
           "JOIN FETCH s.invigilator " +
           "LEFT JOIN FETCH s.coInvigilator " +
           "WHERE s.schoolClass.id = :classId AND s.exam.id = :examId " +
           "ORDER BY s.examDate, s.startTime")
    List<ExamSchedule> findByClassAndExamWithDetails(@Param("classId") Long classId, @Param("examId") Long examId);

    @Query("SELECT s FROM ExamSchedule s " +
           "JOIN FETCH s.exam " +
           "JOIN FETCH s.schoolClass " +
           "JOIN FETCH s.subject " +
           "JOIN FETCH s.invigilator " +
           "LEFT JOIN FETCH s.coInvigilator " +
           "WHERE s.invigilator.id = :teacherId OR s.coInvigilator.id = :teacherId " +
           "ORDER BY s.examDate, s.startTime")
    List<ExamSchedule> findTeacherInvigilationDutiesWithDetails(@Param("teacherId") Long teacherId);
}
