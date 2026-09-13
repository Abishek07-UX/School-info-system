package com.schoolsystem.backend.administration.model;

import com.schoolsystem.backend.user.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classes")
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "grade_level", nullable = false)
    private Integer gradeLevel;

    @Column
    private Integer capacity = 45;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_teacher_id")
    private User classTeacher;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public SchoolClass() {
    }

    public SchoolClass(String name, Integer gradeLevel, Integer capacity, User classTeacher) {
        this.name = name;
        this.gradeLevel = gradeLevel;
        this.capacity = capacity != null ? capacity : 45;
        this.classTeacher = classTeacher;
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

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public User getClassTeacher() {
        return classTeacher;
    }

    public void setClassTeacher(User classTeacher) {
        this.classTeacher = classTeacher;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
