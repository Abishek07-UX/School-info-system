package com.schoolsystem.backend.timetable.model;

import com.schoolsystem.backend.academic.model.Exam;
import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.user.model.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "exam_schedules")
public class ExamSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = true)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = true)
    private Subject subject;

    @Column(name = "custom_subject_name", length = 150)
    private String customSubjectName;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "room", length = 100)
    private String room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invigilator_id", nullable = false)
    private User invigilator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "co_invigilator_id")
    private User coInvigilator;

    @Column(name = "max_marks")
    private Integer maxMarks = 100;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ExamSchedule() {
    }

    public ExamSchedule(Exam exam, SchoolClass schoolClass, Subject subject,
                        LocalDate examDate, LocalTime startTime, LocalTime endTime,
                        String room, User invigilator, User coInvigilator,
                        Integer maxMarks, String instructions) {
        this.exam = exam;
        this.schoolClass = schoolClass;
        this.subject = subject;
        this.examDate = examDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
        this.invigilator = invigilator;
        this.coInvigilator = coInvigilator;
        this.maxMarks = maxMarks != null ? maxMarks : 100;
        this.instructions = instructions;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.maxMarks == null) {
            this.maxMarks = 100;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Exam getExam() {
        return exam;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }

    public SchoolClass getSchoolClass() {
        return schoolClass;
    }

    public void setSchoolClass(SchoolClass schoolClass) {
        this.schoolClass = schoolClass;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public String getCustomSubjectName() {
        return customSubjectName;
    }

    public void setCustomSubjectName(String customSubjectName) {
        this.customSubjectName = customSubjectName;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public User getInvigilator() {
        return invigilator;
    }

    public void setInvigilator(User invigilator) {
        this.invigilator = invigilator;
    }

    public User getCoInvigilator() {
        return coInvigilator;
    }

    public void setCoInvigilator(User coInvigilator) {
        this.coInvigilator = coInvigilator;
    }

    public Integer getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Integer maxMarks) {
        this.maxMarks = maxMarks;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
