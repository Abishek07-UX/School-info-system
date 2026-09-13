package com.schoolsystem.backend.administration.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Subject() {
    }

    public Subject(String name, String code, Integer gradeLevel) {
        this.name = name;
        this.code = code;
        this.gradeLevel = gradeLevel;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
