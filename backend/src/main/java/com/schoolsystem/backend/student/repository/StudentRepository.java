package com.schoolsystem.backend.student.repository;

import com.schoolsystem.backend.student.model.Student;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long>, JpaSpecificationExecutor<Student> {

    Optional<Student> findByAdmissionNumber(String admissionNumber);

    List<Student> findBySchoolClassIdOrderByLastNameAscFirstNameAsc(Long classId);

    List<Student> findBySchoolClassIdAndStatusOrderByLastNameAscFirstNameAsc(Long classId, String status);

    long countBySchoolClassId(Long classId);

    @Override
    @EntityGraph(attributePaths = {"schoolClass", "section"})
    List<Student> findAll(Specification<Student> spec, Sort sort);

    default List<Student> searchStudents(String query, Long classId, Integer admissionYear, String status) {
        Specification<Student> spec = (root, cq, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (query != null && !query.trim().isEmpty()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern),
                        cb.like(cb.lower(root.get("admissionNumber")), pattern)
                ));
            }

            if (classId != null) {
                predicates.add(cb.equal(root.get("schoolClass").get("id"), classId));
            }

            if (admissionYear != null) {
                predicates.add(cb.equal(root.get("admissionYear"), admissionYear));
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(root.get("status"), status.trim()));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return findAll(spec, Sort.by(Sort.Direction.DESC, "id"));
    }
}
