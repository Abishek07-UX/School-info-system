package com.schoolsystem.backend.timetable.repository;

import com.schoolsystem.backend.timetable.model.DayOfWeek;
import com.schoolsystem.backend.timetable.model.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableSlot, Long> {

    List<TimetableSlot> findBySchoolClassIdAndAcademicYear(Long classId, Integer academicYear);

    List<TimetableSlot> findByTeacherIdAndAcademicYear(Long teacherId, Integer academicYear);

    List<TimetableSlot> findByAcademicYear(Integer academicYear);

    Optional<TimetableSlot> findBySchoolClassIdAndDayOfWeekAndPeriodNumberAndAcademicYear(
            Long classId, DayOfWeek dayOfWeek, Integer periodNumber, Integer academicYear);

    Optional<TimetableSlot> findByTeacherIdAndDayOfWeekAndPeriodNumberAndAcademicYear(
            Long teacherId, DayOfWeek dayOfWeek, Integer periodNumber, Integer academicYear);

    @Modifying
    @Query("DELETE FROM TimetableSlot t WHERE t.schoolClass.id = :classId AND t.academicYear = :academicYear")
    void deleteBySchoolClassIdAndAcademicYear(@Param("classId") Long classId, @Param("academicYear") Integer academicYear);

    @Query("SELECT t FROM TimetableSlot t " +
           "JOIN FETCH t.schoolClass " +
           "JOIN FETCH t.subject " +
           "JOIN FETCH t.teacher " +
           "WHERE t.schoolClass.id = :classId AND t.academicYear = :academicYear " +
           "ORDER BY t.dayOfWeek, t.periodNumber")
    List<TimetableSlot> findClassTimetableWithDetails(@Param("classId") Long classId, @Param("academicYear") Integer academicYear);

    @Query("SELECT t FROM TimetableSlot t " +
           "JOIN FETCH t.schoolClass " +
           "JOIN FETCH t.subject " +
           "JOIN FETCH t.teacher " +
           "WHERE t.teacher.id = :teacherId AND t.academicYear = :academicYear " +
           "ORDER BY t.dayOfWeek, t.periodNumber")
    List<TimetableSlot> findTeacherScheduleWithDetails(@Param("teacherId") Long teacherId, @Param("academicYear") Integer academicYear);
}
