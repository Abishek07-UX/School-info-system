package com.schoolsystem.backend.timetable.service;

import com.schoolsystem.backend.administration.model.SchoolClass;
import com.schoolsystem.backend.administration.model.Subject;
import com.schoolsystem.backend.administration.repository.SchoolClassRepository;
import com.schoolsystem.backend.administration.repository.SubjectRepository;
import com.schoolsystem.backend.teacher.model.TeacherSubject;
import com.schoolsystem.backend.teacher.repository.TeacherSubjectRepository;
import com.schoolsystem.backend.timetable.model.DayOfWeek;
import com.schoolsystem.backend.timetable.model.PeriodSlot;
import com.schoolsystem.backend.timetable.model.TimetableSlot;
import com.schoolsystem.backend.timetable.repository.TimetableRepository;
import com.schoolsystem.backend.user.model.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class TimetableAutoGeneratorService {

    private final TimetableRepository timetableRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherSubjectRepository teacherSubjectRepository;

    public TimetableAutoGeneratorService(TimetableRepository timetableRepository,
                                       SchoolClassRepository schoolClassRepository,
                                       SubjectRepository subjectRepository,
                                       TeacherSubjectRepository teacherSubjectRepository) {
        this.timetableRepository = timetableRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
        this.teacherSubjectRepository = teacherSubjectRepository;
    }

    private static class SubjectQuota {
        Subject subject;
        User teacher;
        int remainingPeriods;

        SubjectQuota(Subject subject, User teacher, int quota) {
            this.subject = subject;
            this.teacher = teacher;
            this.remainingPeriods = quota;
        }
    }

    /**
     * Automatically generates a conflict-free weekly timetable (40 slots) for the specified class.
     */
    @Transactional
    public List<TimetableSlot> generateTimetableForClass(Long classId, Integer academicYear) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found with ID: " + classId));

        // 1. Fetch all subjects for this grade level
        List<Subject> gradeSubjects = subjectRepository.findByGradeLevelOrderByNameAsc(schoolClass.getGradeLevel());
        if (gradeSubjects.isEmpty()) {
            gradeSubjects = subjectRepository.findAll();
        }

        // 2. Fetch teacher-subject assignments for this class
        List<TeacherSubject> teacherAllocations = teacherSubjectRepository.findBySchoolClassId(classId);
        Map<Long, User> subjectTeacherMap = new HashMap<>();
        for (TeacherSubject ts : teacherAllocations) {
            subjectTeacherMap.put(ts.getSubject().getId(), ts.getTeacher());
        }

        // Fallback default teacher if unallocated (use class teacher or any available staff)
        User defaultTeacher = schoolClass.getClassTeacher();

        // 3. Build quota list for 40 periods (8 periods x 5 days)
        List<SubjectQuota> quotas = buildSubjectQuotas(gradeSubjects, subjectTeacherMap, defaultTeacher);

        // 4. Fetch all existing teacher bookings across the entire school for this academic year (excluding this class)
        List<TimetableSlot> allExistingSlots = timetableRepository.findByAcademicYear(academicYear);
        Set<String> teacherBusyKeys = new HashSet<>(); // "teacherId-day-period"
        for (TimetableSlot slot : allExistingSlots) {
            if (!slot.getSchoolClass().getId().equals(classId)) {
                teacherBusyKeys.add(getTeacherKey(slot.getTeacher().getId(), slot.getDayOfWeek(), slot.getPeriodNumber()));
            }
        }

        // 5. Run Backtracking Constraint Solver
        TimetableSlot[][] grid = new TimetableSlot[5][8]; // 5 days x 8 periods
        Map<Long, Map<DayOfWeek, Integer>> dailySubjectCounts = new HashMap<>();
        for (SubjectQuota q : quotas) {
            dailySubjectCounts.put(q.subject.getId(), new HashMap<>());
        }

        boolean solved = solveTimetable(0, 0, grid, quotas, teacherBusyKeys, dailySubjectCounts, schoolClass, academicYear);

        if (!solved) {
            throw new IllegalStateException("Unable to generate a 100% conflict-free timetable due to severe teacher availability constraints. Please review teacher allocations.");
        }

        // 6. Clear existing slots for this class and persist new conflict-free slots
        timetableRepository.deleteBySchoolClassIdAndAcademicYear(classId, academicYear);

        List<TimetableSlot> generatedSlots = new ArrayList<>();
        DayOfWeek[] days = DayOfWeek.values();

        for (int d = 0; d < 5; d++) {
            for (int p = 0; p < 8; p++) {
                TimetableSlot slot = grid[d][p];
                if (slot != null) {
                    generatedSlots.add(slot);
                }
            }
        }

        return timetableRepository.saveAll(generatedSlots);
    }

    private boolean solveTimetable(int dayIndex, int periodIndex,
                                   TimetableSlot[][] grid,
                                   List<SubjectQuota> quotas,
                                   Set<String> teacherBusyKeys,
                                   Map<Long, Map<DayOfWeek, Integer>> dailySubjectCounts,
                                   SchoolClass schoolClass,
                                   Integer academicYear) {

        if (dayIndex >= 5) {
            return true; // All 5 days and 40 slots successfully scheduled!
        }

        int nextPeriod = (periodIndex + 1) % 8;
        int nextDay = (periodIndex + 1 == 8) ? dayIndex + 1 : dayIndex;

        DayOfWeek currentDay = DayOfWeek.values()[dayIndex];
        int periodNumber = periodIndex + 1;

        // Sort quotas: subjects with the most remaining periods tried first
        quotas.sort((a, b) -> Integer.compare(b.remainingPeriods, a.remainingPeriods));

        for (SubjectQuota quota : quotas) {
            if (quota.remainingPeriods <= 0) {
                continue;
            }

            // Constraint 1: Teacher availability across school
            if (quota.teacher != null) {
                String teacherKey = getTeacherKey(quota.teacher.getId(), currentDay, periodNumber);
                if (teacherBusyKeys.contains(teacherKey)) {
                    continue; // Teacher is teaching another class at this time!
                }
            }

            // Constraint 2: Subject balance (maximum 2 periods of same subject on the same day)
            int todayCount = dailySubjectCounts.get(quota.subject.getId()).getOrDefault(currentDay, 0);
            if (todayCount >= 2) {
                continue;
            }

            // Place slot
            PeriodSlot pSlot = PeriodSlot.fromNumber(periodNumber);
            TimetableSlot slot = new TimetableSlot(
                    schoolClass,
                    quota.subject,
                    quota.teacher,
                    currentDay,
                    periodNumber,
                    academicYear
            );
            slot.setStartTime(pSlot.getStartTime());
            slot.setEndTime(pSlot.getEndTime());

            grid[dayIndex][periodIndex] = slot;
            quota.remainingPeriods--;
            dailySubjectCounts.get(quota.subject.getId()).put(currentDay, todayCount + 1);

            String teacherKey = quota.teacher != null ? getTeacherKey(quota.teacher.getId(), currentDay, periodNumber) : null;
            if (teacherKey != null) teacherBusyKeys.add(teacherKey);

            // Recurse to next period
            if (solveTimetable(nextDay, nextPeriod, grid, quotas, teacherBusyKeys, dailySubjectCounts, schoolClass, academicYear)) {
                return true;
            }

            // Backtrack
            grid[dayIndex][periodIndex] = null;
            quota.remainingPeriods++;
            dailySubjectCounts.get(quota.subject.getId()).put(currentDay, todayCount);
            if (teacherKey != null) teacherBusyKeys.remove(teacherKey);
        }

        return false;
    }

    private List<SubjectQuota> buildSubjectQuotas(List<Subject> subjects, Map<Long, User> teacherMap, User fallbackTeacher) {
        List<SubjectQuota> list = new ArrayList<>();
        int totalSlots = 40;
        int numSubjects = subjects.size();

        if (numSubjects == 0) {
            return list;
        }

        int baseQuota = totalSlots / numSubjects;
        int remainder = totalSlots % numSubjects;

        for (int i = 0; i < numSubjects; i++) {
            Subject s = subjects.get(i);
            User teacher = teacherMap.getOrDefault(s.getId(), fallbackTeacher);
            int quota = baseQuota + (i < remainder ? 1 : 0);
            list.add(new SubjectQuota(s, teacher, quota));
        }

        return list;
    }

    private String getTeacherKey(Long teacherId, DayOfWeek day, int period) {
        return teacherId + "-" + day.name() + "-" + period;
    }
}
