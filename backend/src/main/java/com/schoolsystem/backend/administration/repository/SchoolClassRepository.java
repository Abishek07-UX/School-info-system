package com.schoolsystem.backend.administration.repository;

import com.schoolsystem.backend.administration.model.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.List;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {

    @EntityGraph(attributePaths = "classTeacher")
    List<SchoolClass> findAllByOrderByGradeLevelAscNameAsc();

    @EntityGraph(attributePaths = "classTeacher")
    List<SchoolClass> findByGradeLevelOrderByNameAsc(Integer gradeLevel);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM SchoolClass c WHERE c.gradeLevel = :gradeLevel ORDER BY c.id")
    List<SchoolClass> lockByGradeLevel(@Param("gradeLevel") Integer gradeLevel);

    List<SchoolClass> findByClassTeacherId(Long teacherId);
}
