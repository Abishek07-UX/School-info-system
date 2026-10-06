package com.schoolsystem.backend.administration.dto.response;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Section;

import java.util.ArrayList;
import java.util.List;

public class SectionDTO {

    private Long id;
    private String name;
    private Integer gradeLevel;
    private Long classId;
    private int totalCapacity;
    private int totalStudents;
    private int classCount;
    private List<ClassSummaryDTO> classes = new ArrayList<>();

    public static class ClassSummaryDTO {
        private Long id;
        private String name;
        private Integer gradeLevel;
        private Integer capacity;
        private int studentCount;
        private String classTeacherName;

        public ClassSummaryDTO() {
        }

        public ClassSummaryDTO(SchoolClass sc, int studentCount) {
            if (sc == null) return;
            this.id = sc.getId();
            this.name = sc.getName();
            this.gradeLevel = sc.getGradeLevel();
            this.capacity = sc.getCapacity() != null ? sc.getCapacity() : 45;
            this.studentCount = studentCount;
            try {
                if (sc.getClassTeacher() != null) {
                    this.classTeacherName = sc.getClassTeacher().getFullName();
                }
            } catch (Exception ignored) {
            }
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public Integer getGradeLevel() {
            return gradeLevel;
        }

        public Integer getGrade() {
            return gradeLevel;
        }

        public Integer getCapacity() {
            return capacity;
        }

        public int getStudentCount() {
            return studentCount;
        }

        public String getClassTeacherName() {
            return classTeacherName;
        }
    }

    public SectionDTO() {
    }

    public SectionDTO(Section s) {
        if (s == null) return;
        this.id = s.getId();
        this.name = s.getName();
        this.gradeLevel = s.getGradeLevel();
        try {
            if (s.getSchoolClass() != null) {
                this.classId = s.getSchoolClass().getId();
            }
        } catch (Exception ignored) {
        }
    }

    public SectionDTO(Section s, List<ClassSummaryDTO> classList) {
        if (s == null) return;
        this.id = s.getId();
        this.name = s.getName();
        this.gradeLevel = s.getGradeLevel();
        try {
            if (s.getSchoolClass() != null) {
                this.classId = s.getSchoolClass().getId();
            }
        } catch (Exception ignored) {
        }
        if (classList != null) {
            this.classes = classList;
            this.classCount = classList.size();
            this.totalCapacity = classList.stream()
                    .mapToInt(c -> c.getCapacity() != null ? c.getCapacity() : 0)
                    .sum();
            this.totalStudents = classList.stream()
                    .mapToInt(ClassSummaryDTO::getStudentCount)
                    .sum();
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public Integer getGrade() {
        return gradeLevel;
    }

    public Long getClassId() {
        return classId;
    }

    public int getTotalCapacity() {
        return totalCapacity;
    }

    public int getTotalStudents() {
        return totalStudents;
    }

    public int getClassCount() {
        return classCount;
    }

    public List<ClassSummaryDTO> getClasses() {
        return classes;
    }
}

