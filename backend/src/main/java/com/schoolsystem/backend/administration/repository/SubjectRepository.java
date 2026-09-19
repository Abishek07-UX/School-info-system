package com.schoolsystem.backend.administration.repository;

import com.schoolsystem.backend.administration.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByCode(String code);

    List<Subject> findByGradeLevelOrderByNameAsc(Integer gradeLevel);

    List<Subject> findAllByOrderByGradeLevelAscNameAsc();
}
