package com.schoolsystem.backend.academic.repository;

import com.schoolsystem.backend.academic.model.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {

    List<Mark> findByExamId(Long examId);

    List<Mark> findByExamIdAndSubjectId(Long examId, Long subjectId);

    List<Mark> findByExamIdAndStudentId(Long examId, Long studentId);

    Optional<Mark> findByExamIdAndStudentIdAndSubjectId(Long examId, Long studentId, Long subjectId);

    List<Mark> findByStudentIdOrderByExamStartDateDesc(Long studentId);

    @Query("SELECT m FROM Mark m WHERE m.student.id = :studentId AND m.exam.academicYear = :academicYear ORDER BY m.exam.term ASC, m.subject.name ASC")
    List<Mark> findByStudentIdAndAcademicYear(@Param("studentId") Long studentId, @Param("academicYear") Integer academicYear);

    @Query("SELECT m FROM Mark m WHERE m.exam.schoolClass.id = :classId AND m.exam.id = :examId")
    List<Mark> findByClassIdAndExamId(@Param("classId") Long classId, @Param("examId") Long examId);

    @Query("SELECT COUNT(m) FROM Mark m WHERE m.exam.id = :examId")
    long countMarksByExamId(@Param("examId") Long examId);

    @Query("SELECT m FROM Mark m WHERE m.exam.id = :examId AND m.subject.id = :subjectId")
    List<Mark> findSubjectMarksForExam(@Param("examId") Long examId, @Param("subjectId") Long subjectId);
}
