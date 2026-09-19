package com.schoolsystem.backend.administration.repository;

import com.schoolsystem.backend.administration.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findBySchoolClassIdOrderByNameAsc(Long classId);
}
