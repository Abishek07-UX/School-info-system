package com.schoolsystem.backend.academic.dto.response;

import com.schoolsystem.backend.administration.model.SchoolClass;

public class ClassSummaryDTO {

    private Long id;
    private String name;
    private Integer gradeLevel;
    private Integer capacity;
    private Long classTeacherId;
    private String classTeacherName;

    public ClassSummaryDTO() {
    }

    public static ClassSummaryDTO fromEntity(SchoolClass sc) {
        if (sc == null) return null;
        ClassSummaryDTO dto = new ClassSummaryDTO();
        dto.setId(sc.getId());
        dto.setName(sc.getName());
        dto.setGradeLevel(sc.getGradeLevel());
        dto.setCapacity(sc.getCapacity());
        if (sc.getClassTeacher() != null) {
            dto.setClassTeacherId(sc.getClassTeacher().getId());
            dto.setClassTeacherName(sc.getClassTeacher().getFullName());
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getClassTeacherId() {
        return classTeacherId;
    }

    public void setClassTeacherId(Long classTeacherId) {
        this.classTeacherId = classTeacherId;
    }

    public String getClassTeacherName() {
        return classTeacherName;
    }

    public void setClassTeacherName(String classTeacherName) {
        this.classTeacherName = classTeacherName;
    }
}
