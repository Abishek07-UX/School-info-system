package com.schoolsystem.backend.administration.repository;

import com.schoolsystem.backend.administration.model.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {

    List<SchoolClass> findAllByOrderByGradeLevelAscNameAsc();

    List<SchoolClass> findByGradeLevelOrderByNameAsc(Integer gradeLevel);

    List<SchoolClass> findByClassTeacherId(Long teacherId);
}
