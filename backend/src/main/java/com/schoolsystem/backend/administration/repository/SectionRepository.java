package com.schoolsystem.backend.administration.repository;

import com.schoolsystem.backend.administration.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findAllByOrderByGradeLevelAscNameAsc();

    List<Section> findByGradeLevelOrderByNameAsc(Integer gradeLevel);

    Optional<Section> findByNameIgnoreCase(String name);

    Optional<Section> findByNameAndGradeLevel(String name, Integer gradeLevel);

    List<Section> findBySchoolClassIdOrderByNameAsc(Long classId);

    List<Section> findBySchoolClassId(Long classId);
}

