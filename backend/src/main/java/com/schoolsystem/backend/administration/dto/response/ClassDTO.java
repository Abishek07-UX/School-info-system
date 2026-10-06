package com.schoolsystem.backend.administration.dto.response;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Section;

import java.util.ArrayList;
import java.util.List;

public class ClassDTO {

    private Long id;
    private String name;
    private Integer gradeLevel;
    private Integer capacity;
    private Long classTeacherId;
    private String classTeacherName;
    private Long sectionId;
    private String sectionName;
    private int studentCount;
    private List<SectionDTO> sections = new ArrayList<>();

    public ClassDTO() {
    }

    public ClassDTO(SchoolClass sc, List<Section> sectionList) {
        this(sc, sectionList, 0);
    }

    public ClassDTO(SchoolClass sc, List<Section> sectionList, int studentCount) {
        if (sc == null) return;
        this.id = sc.getId();
        this.name = sc.getName();
        this.gradeLevel = sc.getGradeLevel();
        this.capacity = sc.getCapacity();
        this.studentCount = studentCount;
        try {
            if (sc.getClassTeacher() != null) {
                this.classTeacherId = sc.getClassTeacher().getId();
                this.classTeacherName = sc.getClassTeacher().getFullName();
            }
        } catch (Exception ignored) {
        }
        try {
            if (sc.getSection() != null) {
                this.sectionId = sc.getSection().getId();
                this.sectionName = sc.getSection().getName();
            }
        } catch (Exception ignored) {
        }
        if (sectionList != null) {
            for (Section s : sectionList) {
                this.sections.add(new SectionDTO(s));
            }
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

    public Long getClassTeacherId() {
        return classTeacherId;
    }

    public String getClassTeacherName() {
        return classTeacherName;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public int getStudentCount() {
        return studentCount;
    }

    public List<SectionDTO> getSections() {
        return sections;
    }
}

