package com.schoolsystem.backend.timetable.model;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.user.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "timetables", uniqueConstraints = {
        @UniqueConstraint(name = "uq_class_day_period_year", columnNames = {"class_id", "day_of_week", "period_number", "academic_year"})
})
public class TimetableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 20)
    private DayOfWeek dayOfWeek;

    @Column(name = "period_number", nullable = false)
    private Integer periodNumber;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TimetableSlot() {
    }

    public TimetableSlot(SchoolClass schoolClass, Subject subject, User teacher,
                         DayOfWeek dayOfWeek, Integer periodNumber, Integer academicYear) {
        this.schoolClass = schoolClass;
        this.subject = subject;
        this.teacher = teacher;
        this.dayOfWeek = dayOfWeek;
        this.periodNumber = periodNumber;
        this.academicYear = academicYear;

        PeriodSlot slot = PeriodSlot.fromNumber(periodNumber);
        this.startTime = slot.getStartTime();
        this.endTime = slot.getEndTime();
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.startTime == null || this.endTime == null) {
            PeriodSlot slot = PeriodSlot.fromNumber(this.periodNumber);
            this.startTime = slot.getStartTime();
            this.endTime = slot.getEndTime();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
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

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public Integer getPeriodNumber() {
        return periodNumber;
    }

    public void setPeriodNumber(Integer periodNumber) {
        this.periodNumber = periodNumber;
        PeriodSlot slot = PeriodSlot.fromNumber(periodNumber);
        this.startTime = slot.getStartTime();
        this.endTime = slot.getEndTime();
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

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
