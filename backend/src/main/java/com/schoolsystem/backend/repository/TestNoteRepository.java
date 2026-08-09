package com.schoolsystem.backend.repository;

import com.schoolsystem.backend.model.TestNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestNoteRepository extends JpaRepository<TestNote, Long> {
    List<TestNote> findAllByOrderByCreatedAtDesc();
}
