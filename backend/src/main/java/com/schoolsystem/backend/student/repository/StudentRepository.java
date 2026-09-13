package com.schoolsystem.backend.student.repository;

import com.schoolsystem.backend.student.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByAdmissionNumber(String admissionNumber);

    List<Student> findBySchoolClassIdOrderByLastNameAscFirstNameAsc(Long classId);

    List<Student> findBySchoolClassIdAndStatusOrderByLastNameAscFirstNameAsc(Long classId, String status);

    long countBySchoolClassId(Long classId);
}
