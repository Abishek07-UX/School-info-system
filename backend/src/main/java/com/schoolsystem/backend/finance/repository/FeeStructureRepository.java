package com.schoolsystem.backend.finance.repository;

import com.schoolsystem.backend.finance.model.FeeStructure;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {

    @EntityGraph(attributePaths = {"schoolClass"})
    List<FeeStructure> findBySchoolClassId(Long classId);

    @EntityGraph(attributePaths = {"schoolClass"})
    List<FeeStructure> findByAcademicYear(Integer academicYear);

    @EntityGraph(attributePaths = {"schoolClass"})
    List<FeeStructure> findBySchoolClassIdAndAcademicYearAndTerm(Long classId, Integer academicYear, String term);

    @Override
    @EntityGraph(attributePaths = {"schoolClass"})
    List<FeeStructure> findAll();
}
