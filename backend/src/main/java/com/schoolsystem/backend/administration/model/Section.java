package com.schoolsystem.backend.administration.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sections")
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "grade_level")
    private Integer gradeLevel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "class_id", nullable = true)
    private SchoolClass schoolClass;

    @OneToMany(mappedBy = "section", fetch = FetchType.LAZY)
    private List<SchoolClass> classes = new ArrayList<>();

    public Section() {
    }

    public Section(String name, Integer gradeLevel) {
        this.name = name;
        this.gradeLevel = gradeLevel;
    }

    public Section(String name, SchoolClass schoolClass) {
        this.name = name;
        this.schoolClass = schoolClass;
        if (schoolClass != null && this.gradeLevel == null) {
            this.gradeLevel = schoolClass.getGradeLevel();
        }
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

    public SchoolClass getSchoolClass() {
        return schoolClass;
    }

    public void setSchoolClass(SchoolClass schoolClass) {
        this.schoolClass = schoolClass;
    }

    public List<SchoolClass> getClasses() {
        return classes;
    }

    public void setClasses(List<SchoolClass> classes) {
        this.classes = classes != null ? classes : new ArrayList<>();
    }

    public int getTotalCapacity() {
        if (classes == null) return 0;
        return classes.stream()
                .mapToInt(c -> c.getCapacity() != null ? c.getCapacity() : 0)
                .sum();
    }
}

