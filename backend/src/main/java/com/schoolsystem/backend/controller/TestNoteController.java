package com.schoolsystem.backend.controller;

import com.schoolsystem.backend.model.TestNote;
import com.schoolsystem.backend.repository.TestNoteRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test-notes")
@CrossOrigin(origins = "*")
public class TestNoteController {

    private final TestNoteRepository repository;

    public TestNoteController(TestNoteRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<TestNote>> getAllNotes() {
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    public ResponseEntity<?> createNote(@Valid @RequestBody TestNote noteRequest) {
        if (noteRequest.getContent() == null || noteRequest.getContent().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Text content cannot be empty.");
            return ResponseEntity.badRequest().body(error);
        }
        
        TestNote savedNote = repository.save(TestNote.builder()
                .content(noteRequest.getContent().trim())
                .build());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Note not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
        repository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Note deleted successfully.");
        response.put("id", id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        try {
            long count = repository.count();
            health.put("status", "UP");
            health.put("database", "Connected");
            health.put("totalSavedNotes", count);
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("database", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(health);
        }
    }
}
