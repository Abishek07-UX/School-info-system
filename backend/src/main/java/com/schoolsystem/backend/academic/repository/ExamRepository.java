package com.schoolsystem.backend.academic.repository;

import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.academic.model.ExamStatus;
import com.schoolsystem.backend.academic.model.ExamTerm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByAcademicYearOrderByStartDateDesc(Integer academicYear);

    List<Exam> findBySchoolClassIdOrderByStartDateDesc(Long classId);

    List<Exam> findBySchoolClassIdAndAcademicYearOrderByTermAsc(Long classId, Integer academicYear);

    Optional<Exam> findBySchoolClassIdAndAcademicYearAndTerm(Long classId, Integer academicYear, ExamTerm term);

    List<Exam> findByStatus(ExamStatus status);

    @Query("SELECT e FROM Exam e LEFT JOIN e.schoolClass sc WHERE " +
            "(:academicYear IS NULL OR e.academicYear = :academicYear) AND " +
            "(:term IS NULL OR e.term = :term) AND " +
            "(:classId IS NULL OR (sc IS NOT NULL AND sc.id = :classId)) AND " +
            "(:status IS NULL OR e.status = :status) " +
            "ORDER BY e.startDate DESC")
    List<Exam> searchExams(@Param("academicYear") Integer academicYear,
                           @Param("term") ExamTerm term,
                           @Param("classId") Long classId,
                           @Param("status") ExamStatus status);
}
