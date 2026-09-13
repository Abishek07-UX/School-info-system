package com.schoolsystem.backend.teacher.repository;

import com.schoolsystem.backend.teacher.model.TeacherSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherSubjectRepository extends JpaRepository<TeacherSubject, Long> {

    List<TeacherSubject> findByTeacherId(Long teacherId);

    List<TeacherSubject> findBySchoolClassId(Long classId);

    List<TeacherSubject> findBySubjectId(Long subjectId);

    Optional<TeacherSubject> findByTeacherIdAndSubjectIdAndSchoolClassId(Long teacherId, Long subjectId, Long classId);

    Optional<TeacherSubject> findBySubjectIdAndSchoolClassId(Long subjectId, Long classId);
}
