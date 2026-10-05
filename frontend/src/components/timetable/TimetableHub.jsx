import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import {
  Calendar,
  Users,
  GraduationCap,
  Printer,
  Wand2,
  Trash2,
  Plus,
  Loader2,
  RefreshCw,
  BookOpen,
  Award,
  Sparkles,
  Search,
  X,
  Filter,
  CalendarCheck,
  Clock,
} from 'lucide-react'
import { timetableService } from '../../services/timetableService'
import { examScheduleService } from '../../services/examScheduleService'
import { academicService, isSchoolWideExam, getExamGradeLevel } from '../../services/academicService'
import { useAuthUser } from '../../context/AuthUserContext'
import { ClassTimetableGrid } from './ClassTimetableGrid'
import { TimetableSlotModal } from './TimetableSlotModal'
import { TeacherScheduleGrid } from './TeacherScheduleGrid'
import { ExamScheduleModal } from './ExamScheduleModal'
import { AutoGeneratorModal } from './AutoGeneratorModal'
import { PrintableTimetable } from './PrintableTimetable'
import ExamTimetableModal from '../academic/ExamTimetableModal'

const EXAM_TERM_LABELS = {
  TERM_1: 'Term 1',
  TERM_2: 'Term 2',
  TERM_3: 'Term 3',
  OTHER: 'Other / Special',
}

const getExamTermLabel = (term) => EXAM_TERM_LABELS[term] || term

export function TimetableHub({ userRole = 'ADMIN', userProfile: propUserProfile, getToken }) {
  const authCtx = useAuthUser()
  const userProfile = propUserProfile || authCtx?.userProfile
  const role = userRole || authCtx?.role || 'TEACHER'
  const isAdmin = role === 'ADMIN'
  const isPrincipal = role === 'PRINCIPAL'
  const isTeacher = role === 'TEACHER' || authCtx?.isTeacher

  const [activeTab, setActiveTab] = useState(isTeacher ? 'teachers' : 'classes')
  const [academicYear, setAcademicYear] = useState(2026)

  // Lookups
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [exams, setExams] = useState([])
  const [campusRooms, setCampusRooms] = useState([])

  // Selection states
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState(isTeacher ? userProfile?.id || '' : '')
  const [examGradeFilter, setExamGradeFilter] = useState('ALL') // 'ALL', '1'..'13', 'SCHOOL_WIDE'
  const [examTermFilter, setExamTermFilter] = useState('ALL') // 'ALL', 'TERM_1', 'TERM_2', 'TERM_3', 'OTHER'
  const [examSectionFilter, setExamSectionFilter] = useState('ALL') // 'ALL', or classId
  const [examYearFilter, setExamYearFilter] = useState(String(new Date().getFullYear())) // 'ALL' or a year
  const [visibleExamCount, setVisibleExamCount] = useState(48)
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('')

  // Data states
  const [classTimetable, setClassTimetable] = useState(null)
  const [teacherSchedule, setTeacherSchedule] = useState(null)
  const [examSchedules, setExamSchedules] = useState([])
  const [teacherDuties, setTeacherDuties] = useState([])

  // Loading states
  const [loadingClass, setLoadingClass] = useState(false)
  const [loadingTeacher, setLoadingTeacher] = useState(false)
  const [loadingExams, setLoadingExams] = useState(false)
  const [loadingTeacherDuties, setLoadingTeacherDuties] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  // Teacher personal duties view toggle
  const [onlyMyDuties, setOnlyMyDuties] = useState(false)

  // Modals
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [slotToEdit, setSlotToEdit] = useState(null)
  const [initialDay, setInitialDay] = useState('MONDAY')
  const [initialPeriod, setInitialPeriod] = useState(1)

  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  const [isUnifiedExamModalOpen, setIsUnifiedExamModalOpen] = useState(false)
  const [examScheduleToEdit, setExamScheduleToEdit] = useState(null)

  const [isAutoGeneratorOpen, setIsAutoGeneratorOpen] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [isPrintTeacher, setIsPrintTeacher] = useState(false)

  // In-memory caches for instant tab switching and smooth transitions
  const classCache = useRef(new Map())
  const teacherCache = useRef(new Map())
  const examCache = useRef(new Map())
  const examFetchVersion = useRef(0)
  const examListVersion = useRef(0)

  // Fetch Class Timetable with caching
  const fetchClassTimetable = useCallback(async (targetId, forceRefresh = false) => {
    const classIdToFetch = targetId
    if (!classIdToFetch) return
    const cacheKey = `${classIdToFetch}_${academicYear}`

    if (!forceRefresh && classCache.current.has(cacheKey)) {
      setClassTimetable(classCache.current.get(cacheKey))
      setLoadingClass(false)
      return
    }

    if (forceRefresh || !classCache.current.has(cacheKey)) {
      setClassTimetable(null)
    }

    setLoadingClass(true)
    setErrorMsg(null)
    try {
      const data = await timetableService.getClassTimetable(classIdToFetch, academicYear, getToken)
      classCache.current.set(cacheKey, data)
      setClassTimetable(data)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load class timetable.')
    } finally {
      setLoadingClass(false)
    }
  }, [academicYear, getToken])

  // Fetch Teacher Timetable with caching
  const fetchTeacherSchedule = useCallback(async (targetId, forceRefresh = false) => {
    const teacherIdToFetch = targetId
    if (!teacherIdToFetch) {
      setTeacherSchedule(null)
      return
    }
    const cacheKey = `${teacherIdToFetch}_${academicYear}`

    if (!forceRefresh && teacherCache.current.has(cacheKey)) {
      setTeacherSchedule(teacherCache.current.get(cacheKey))
      setLoadingTeacher(false)
      return
    }

    if (forceRefresh || !teacherCache.current.has(cacheKey)) {
      setTeacherSchedule(null)
    }

    setLoadingTeacher(true)
    setErrorMsg(null)
    try {
      const data = await timetableService.getTeacherSchedule(teacherIdToFetch, academicYear, getToken)
      teacherCache.current.set(cacheKey, data)
      setTeacherSchedule(data)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load teacher schedule.')
    } finally {
      setLoadingTeacher(false)
    }
  }, [academicYear, getToken])

  // Fetch Exam Schedules for exams with in-memory caching
  const fetchExamSchedules = useCallback(async (examsToFetch, forceRefresh = false) => {
    const fetchVersion = ++examFetchVersion.current
    if (!examsToFetch || (Array.isArray(examsToFetch) && examsToFetch.length === 0)) {
      setExamSchedules([])
      setLoadingExams(false)
      return
    }

    const examsList = Array.isArray(examsToFetch)
      ? examsToFetch
      : typeof examsToFetch === 'object' && examsToFetch.id
      ? [examsToFetch]
      : [{ id: examsToFetch }]

    if (forceRefresh) {
      setExamSchedules([])
    }

    setLoadingExams(true)
    setErrorMsg(null)
    try {
      const missingIds = [...new Set(examsList.map((exam) => String(exam.id)))]
        .filter((id) => forceRefresh || !examCache.current.has(id))
      if (missingIds.length) {
        const schedules = await examScheduleService.getExamSchedulesBatch(missingIds, getToken)
        const byExam = new Map(missingIds.map((id) => [id, []]))
        for (const schedule of schedules || []) {
          byExam.get(String(schedule.examId))?.push(schedule)
        }
        for (const [id, examSchedules] of byExam) {
          examCache.current.set(id, examSchedules)
        }
      }

      const combined = examsList.flatMap((exam) => examCache.current.get(String(exam.id)) || [])
      combined.sort((a, b) => {
        const dComp = (a.examDate || '').localeCompare(b.examDate || '')
        if (dComp !== 0) return dComp
        return (a.startTime || '').localeCompare(b.startTime || '')
      })
      if (fetchVersion === examFetchVersion.current) setExamSchedules(combined)
    } catch (err) {
      if (fetchVersion === examFetchVersion.current) setErrorMsg(err.message || 'Failed to load exam schedules.')
    } finally {
      if (fetchVersion === examFetchVersion.current) setLoadingExams(false)
    }
  }, [getToken])

  const classesLoaded = useRef(false)
  // Load the first class and its timetable together to remove a browser request waterfall.
  useEffect(() => {
    if (classesLoaded.current || (activeTab !== 'classes' && activeTab !== 'exams')) return
    let cancelled = false
    async function loadClasses() {
      try {
        if (activeTab === 'classes') {
          try {
            setLoadingClass(true)
            const data = await timetableService.getClassTimetableBootstrap(academicYear, userProfile?.id, getToken)
            if (cancelled) return
            setClasses(data.classes || [])
            if (data.timetable) {
              const id = data.timetable.classId
              classCache.current.set(`${id}_${academicYear}`, data.timetable)
              setSelectedClassId(id)
              setClassTimetable(data.timetable)
            }
          } catch (err) {
            // Support a backend process that has not yet been restarted.
            if (err.status !== 404) throw err
            const cls = await academicService.getClasses(getToken)
            if (cancelled) return
            setClasses(cls || [])
            if (cls?.length) {
              const myClass = cls.find((c) => c.classTeacherId === userProfile?.id)
              setSelectedClassId((current) => current || (myClass || cls[0]).id)
            }
          } finally {
            if (!cancelled) setLoadingClass(false)
          }
        } else {
          const cls = await academicService.getClasses(getToken)
          if (cancelled) return
          setClasses(cls || [])
          if (cls?.length) {
            const myClass = cls.find((c) => c.classTeacherId === userProfile?.id)
            setSelectedClassId((current) => current || (myClass || cls[0]).id)
          }
        }
        if (!cancelled) classesLoaded.current = true
      } catch (err) {
        if (!cancelled) setErrorMsg(err.message || 'Failed to load classes.')
      }
    }
    loadClasses()

    return () => { cancelled = true }
  }, [activeTab, academicYear, getToken, userProfile?.id])

  // The signed-in user's database ID is also their timetable teacher ID.
  useEffect(() => {
    if (isTeacher && userProfile?.id) setSelectedTeacherId(userProfile.id)
  }, [isTeacher, userProfile?.id])

  // Other lists are needed only for their tab or the editing dialogs.
  const lookupRequested = useRef({ teachers: false, subjects: false, rooms: false })
  useEffect(() => {
    const needTeachers = (activeTab === 'teachers' && !isTeacher) || isSlotModalOpen || isExamModalOpen
    const needDetails = isSlotModalOpen || isExamModalOpen
    if (needTeachers && !lookupRequested.current.teachers) {
      lookupRequested.current.teachers = true
      timetableService.getTeachers(getToken).then((data) => {
        setTeachers(data || [])
        if (!isTeacher && data?.length) setSelectedTeacherId((current) => current || data[0].id)
      }).catch((err) => {
        lookupRequested.current.teachers = false
        console.error('Failed to load teachers:', err)
      })
    }
    if (needDetails && !lookupRequested.current.subjects) {
      lookupRequested.current.subjects = true
      academicService.getAllSubjects(getToken).then((data) => setSubjects(data || [])).catch((err) => {
        lookupRequested.current.subjects = false
        console.error('Failed to load subjects:', err)
      })
    }
    if (isExamModalOpen && !lookupRequested.current.rooms) {
      lookupRequested.current.rooms = true
      timetableService.getCampusRooms(getToken).then((data) => setCampusRooms(data || [])).catch((err) => {
        lookupRequested.current.rooms = false
        console.error('Failed to load rooms:', err)
      })
    }
  }, [activeTab, isTeacher, isSlotModalOpen, isExamModalOpen, getToken])

  // Exam records are only needed when opening the exam date sheets tab.
  const loadExams = useCallback(async () => {
    const version = ++examListVersion.current
    try {
      const academicYear = examYearFilter === 'ALL' ? undefined : Number(examYearFilter)
      const examList = await academicService.getExams({ academicYear }, getToken)
      if (version === examListVersion.current) setExams(examList || [])
    } catch (err) {
      console.error('Failed to load exams:', err)
    }
  }, [getToken, examYearFilter])

  useEffect(() => {
    if (activeTab === 'exams') loadExams()
  }, [activeTab, loadExams])

  useEffect(() => {
    if (activeTab === 'classes' && selectedClassId) {
      fetchClassTimetable(selectedClassId)
    }
  }, [activeTab, selectedClassId, fetchClassTimetable])

  // Filter teachers by search query (name, email, phone, role)
  const filteredTeachers = useMemo(() => {
    const query = teacherSearchTerm.trim().toLowerCase()
    if (!query) return teachers

    return teachers.filter((t) => {
      const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase()
      const email = (t.email || '').toLowerCase()
      const phone = (t.phoneNumber || '').toLowerCase()
      const nic = (t.nicNumber || '').toLowerCase()
      const roleDisplayName = (t.roleDisplayName || '').toLowerCase()
      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        nic.includes(query) ||
        roleDisplayName.includes(query)
      )
    })
  }, [teachers, teacherSearchTerm])

  // Synchronize selected teacher when search query or filtered list changes
  useEffect(() => {
    if (isTeacher) return // Teachers are locked to their own ID
    if (!teacherSearchTerm.trim()) {
      if (!selectedTeacherId && teachers.length > 0) {
        setSelectedTeacherId(teachers[0].id)
      }
      return
    }

    const isCurrentSelectedInFiltered = filteredTeachers.some(
      (t) => String(t.id) === String(selectedTeacherId)
    )

    if (!isCurrentSelectedInFiltered) {
      if (filteredTeachers.length > 0) {
        setSelectedTeacherId(filteredTeachers[0].id)
      } else {
        setSelectedTeacherId('')
      }
    }
  }, [teacherSearchTerm, filteredTeachers, teachers, selectedTeacherId])

  useEffect(() => {
    if (activeTab === 'teachers') {
      if (selectedTeacherId) {
        fetchTeacherSchedule(selectedTeacherId)
      } else {
        setTeacherSchedule(null)
      }
    }
  }, [activeTab, selectedTeacherId, fetchTeacherSchedule])

  // Fetch logged-in teacher's assigned examination duties
  const fetchTeacherDuties = useCallback(async () => {
    if (!isTeacher) return
    const targetId = userProfile?.id
    if (!targetId) return

    setLoadingTeacherDuties(true)
    try {
      const data = await examScheduleService.getInvigilatorDuties(targetId, getToken)
      setTeacherDuties(data || [])
    } catch (err) {
      console.error('Failed to load teacher exam duties:', err)
    } finally {
      setLoadingTeacherDuties(false)
    }
  }, [isTeacher, userProfile?.id, getToken])

  useEffect(() => {
    if (isTeacher && activeTab === 'exams') {
      fetchTeacherDuties()
    }
  }, [isTeacher, activeTab, fetchTeacherDuties])

  const handleClearClass = async () => {
    if (!window.confirm('Are you sure you want to clear this entire weekly timetable?')) return
    try {
      await timetableService.clearClassTimetable(selectedClassId, academicYear, getToken)
      classCache.current.clear()
      teacherCache.current.clear()
      fetchClassTimetable(selectedClassId, true)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to clear class timetable.')
    }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this period slot?')) return
    try {
      await timetableService.deleteSlot(slotId, getToken)
      classCache.current.clear()
      teacherCache.current.clear()
      fetchClassTimetable(selectedClassId, true)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete slot.')
    }
  }

  const handleDeleteExamSlot = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) return
    try {
      await examScheduleService.deleteExamSchedule(scheduleId, getToken)
      examCache.current.clear()
      fetchExamSchedules(filteredExams, true)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete exam schedule.')
    }
  }

  const selectedClass = classes.find((c) => String(c.id) === String(selectedClassId))

  // Available academic years discovered in exams
  const availableExamYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = new Set([currentYear, currentYear + 1, 2024, 2025, 2026])
    exams.forEach((e) => {
      if (e.academicYear) years.add(Number(e.academicYear))
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [exams])

  // Available sections (classes) for the selected grade
  const availableSections = useMemo(() => {
    if (examGradeFilter === 'ALL' || examGradeFilter === 'SCHOOL_WIDE') {
      return []
    }
    const gradeNum = Number(examGradeFilter)
    return classes.filter((c) => Number(c.gradeLevel) === gradeNum)
  }, [classes, examGradeFilter])

  // Reset section filter whenever grade selection changes
  useEffect(() => {
    setExamSectionFilter('ALL')
  }, [examGradeFilter])

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // 1. Grade filter
      if (examGradeFilter !== 'ALL' && examGradeFilter !== 'SCHOOL_WIDE') {
        const targetGrade = Number(examGradeFilter)
        const examGrade = getExamGradeLevel(exam)
        if (examGrade !== targetGrade) return false
      }

      // 2. Year filter
      if (examYearFilter !== 'ALL') {
        if (Number(exam.academicYear) !== Number(examYearFilter)) return false
      }

      // 3. Term and Section filters (active when not in school-wide mode)
      if (examGradeFilter !== 'SCHOOL_WIDE') {
        // Term filter
        if (examTermFilter !== 'ALL') {
          const examTerm = exam.term ? String(exam.term).toUpperCase() : ''
          if (examTerm !== examTermFilter) {
            const termNum = examTermFilter.replace('TERM_', '')
            const nameLower = (exam.name || '').toLowerCase()
            const dispLower = (exam.termDisplayName || '').toLowerCase()
            if (!nameLower.includes(`term ${termNum}`) && !dispLower.includes(`term ${termNum}`)) {
              return false
            }
          }
        }

        // Section filter
        if (examSectionFilter !== 'ALL') {
          const targetClassId = String(examSectionFilter)
          const matchClassId = exam.classId && String(exam.classId) === targetClassId
          const targetClass = classes.find((c) => String(c.id) === targetClassId)
          let matchName = false
          if (targetClass) {
            const tName = targetClass.name.toLowerCase()
            const examClsName = (exam.className || '').toLowerCase()
            const examName = (exam.name || '').toLowerCase()
            matchName = examClsName === tName || examClsName.includes(tName) || examName.includes(`(${tName})`) || examName.includes(tName)
          }
          if (!matchClassId && !matchName) {
            return false
          }
        }
      }

      return true
    })
  }, [exams, examGradeFilter, examYearFilter, examTermFilter, examSectionFilter, classes])

  const selectedExam = filteredExams.length > 0 ? filteredExams[0] : null
  const selectedExamId = selectedExam?.id ? String(selectedExam.id) : ''

  // Automatically fetch exam schedules for filtered exams when on exams tab or when filters change
  useEffect(() => {
    if (activeTab === 'exams') {
      fetchExamSchedules(filteredExams)
    }
  }, [activeTab, filteredExams, fetchExamSchedules])

  // Sessions in current exam assigned to this teacher
  const myDutiesInCurrentExam = useMemo(() => {
    if (!isTeacher || !userProfile || !examSchedules) return []
    return examSchedules.filter((item) => {
      const isChief = item.invigilatorId && String(item.invigilatorId) === String(userProfile.id)
      const isCo = item.coInvigilatorId && String(item.coInvigilatorId) === String(userProfile.id)
      const isNameMatch = userProfile.firstName && item.invigilatorName && item.invigilatorName.toLowerCase().includes(userProfile.firstName.toLowerCase())
      return isChief || isCo || isNameMatch
    })
  }, [isTeacher, userProfile, examSchedules])

  // Date sheet displays filtered exam schedules matching active section
  const displayedExamSchedules = useMemo(() => {
    if (examGradeFilter === 'SCHOOL_WIDE') {
      const schoolWideExamIds = new Set(exams.filter(isSchoolWideExam).map((exam) => String(exam.id)))
      return examSchedules.filter((item) =>
        item.classId == null || schoolWideExamIds.has(String(item.examId))
      )
    }
    if (examGradeFilter === 'ALL') return examSchedules
    if (examSectionFilter === 'ALL') return examSchedules.filter((item) => item.classId != null)
    const targetClassId = String(examSectionFilter)
    return examSchedules.filter((item) => String(item.classId) === targetClassId)
  }, [examSchedules, examGradeFilter, examSectionFilter, exams])

  useEffect(() => {
    setVisibleExamCount(48)
  }, [examGradeFilter, examTermFilter, examSectionFilter, examYearFilter])

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Timetable & Scheduling System
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Conflict-free scheduling engine for classes, teachers, and examinations with 40-minute periods and automatic classroom routing.
          </p>
        </div>

        {/* Global Year Selector */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs py-1 px-3 bg-muted/40 font-mono">
            Academic Year {academicYear}
          </Badge>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="py-2.5 text-xs">
          <AlertTitle className="text-xs font-semibold">Error</AlertTitle>
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="teachers" className="flex items-center gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            {isTeacher ? "My Schedule" : "Teacher Schedules"}
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center gap-1.5 text-xs">
            <GraduationCap className="h-3.5 w-3.5" />
            Class Timetables
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Exam Date Sheets
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CLASS TIMETABLES */}
        <TabsContent value="classes" forceMount className="space-y-4 data-[state=inactive]:hidden">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-48">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Grade {c.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchClassTimetable(selectedClassId, true)}
                disabled={loadingClass}
                className="h-8 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1.5 ${loadingClass ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPrintTeacher(false)
                  setIsPrintOpen(true)
                }}
                disabled={!classTimetable}
                className="h-8 text-xs gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Wall Chart
              </Button>

              {isAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearClass}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setIsAutoGeneratorOpen(true)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    Auto-Generate Schedule
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSlotToEdit(null)
                      setInitialDay('MONDAY')
                      setInitialPeriod(1)
                      setIsSlotModalOpen(true)
                    }}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Assign Slot
                  </Button>
                </>
              )}
            </div>
          </div>

          {loadingClass && !classTimetable ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading class timetable...</span>
              </div>
            </div>
          ) : (
            <ClassTimetableGrid
              timetableData={classTimetable}
              isAdmin={isAdmin}
              onAddSlot={(day, period) => {
                setSlotToEdit(null)
                setInitialDay(day)
                setInitialPeriod(period)
                setIsSlotModalOpen(true)
              }}
              onEditSlot={(slot) => {
                setSlotToEdit(slot)
                setIsSlotModalOpen(true)
              }}
              onDeleteSlot={handleDeleteSlot}
            />
          )}
        </TabsContent>

        {/* TAB 2: TEACHER SCHEDULES & ROUTING */}
        <TabsContent value="teachers" forceMount className="space-y-4 data-[state=inactive]:hidden">
          {isTeacher ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {teacherSchedule?.teacherName ? `${teacherSchedule.teacherName}'s Teaching Schedule` : 'My Weekly Teaching Schedule'}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Personal weekly timetable, classroom routing, and free periods.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTeacherSchedule(selectedTeacherId, true)}
                  disabled={loadingTeacher || !selectedTeacherId}
                  className="h-8 text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-1.5 ${loadingTeacher ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPrintTeacher(true)
                    setIsPrintOpen(true)
                  }}
                  disabled={!teacherSchedule}
                  className="h-8 text-xs gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print My Schedule
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Search Input for Teacher Name */}
                  <div className="relative w-64 sm:w-72">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search teacher by name or email..."
                      value={teacherSearchTerm}
                      onChange={(e) => setTeacherSearchTerm(e.target.value)}
                      className="h-8 pl-8 pr-7 text-xs bg-background"
                    />
                    {teacherSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setTeacherSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-sm"
                        title="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtered Teachers Select Dropdown */}
                  <div className="w-64 sm:w-72">
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      disabled={filteredTeachers.length === 0}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    >
                      {filteredTeachers.length === 0 ? (
                        <option value="" disabled>No matching teachers</option>
                      ) : (
                        filteredTeachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.firstName} {t.lastName} ({t.email})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Filter Count Badge */}
                  {teacherSearchTerm.trim() && (
                    <Badge
                      variant="outline"
                      className="text-[11px] h-7 px-2.5 bg-primary/5 text-primary border-primary/20 flex items-center gap-1 font-medium"
                    >
                      <Filter className="h-3 w-3" />
                      {filteredTeachers.length} of {teachers.length} teachers
                    </Badge>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchTeacherSchedule(selectedTeacherId, true)}
                    disabled={loadingTeacher || !selectedTeacherId}
                    className="h-8 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1.5 ${loadingTeacher ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPrintTeacher(true)
                    setIsPrintOpen(true)
                  }}
                  disabled={!teacherSchedule || filteredTeachers.length === 0}
                  className="h-8 text-xs gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Teacher Schedule
                </Button>
              </div>

              {/* Quick-Select pills when search filter matches multiple teachers */}
              {teacherSearchTerm.trim() && filteredTeachers.length > 1 && filteredTeachers.length <= 8 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground text-[11px] font-medium mr-1 flex items-center gap-1">
                    Matching Teachers:
                  </span>
                  {filteredTeachers.map((t) => {
                    const isSelected = String(t.id) === String(selectedTeacherId)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTeacherId(t.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-muted/60 text-foreground hover:bg-muted border border-border/50'
                        }`}
                      >
                        {t.firstName} {t.lastName}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {isTeacher ? (
            loadingTeacher && !teacherSchedule ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
                <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Loading your teaching timetable...</span>
                </div>
              </div>
            ) : !selectedTeacherId ? (
              <Card className="border-dashed p-10 text-center text-xs space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 mx-auto text-muted-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Teacher Profile Not Linked</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your account is not yet mapped to a faculty teaching profile. Please contact the administrator.
                  </p>
                </div>
              </Card>
            ) : !teacherSchedule || (teacherSchedule.totalTeachingPeriods === 0 && (!teacherSchedule.weeklyGrid || Object.keys(teacherSchedule.weeklyGrid).length === 0)) ? (
              <Card className="border-dashed p-10 text-center text-xs space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 mx-auto text-muted-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">No Timetable Assigned Yet</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    You currently have no class periods assigned for academic year {academicYear}. Once the administrator schedules your classes, they will appear here.
                  </p>
                </div>
              </Card>
            ) : (
              <TeacherScheduleGrid scheduleData={teacherSchedule} />
            )
          ) : (
            filteredTeachers.length === 0 ? (
              <Card className="border-dashed p-10 text-center text-xs space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 mx-auto text-muted-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">No faculty members found</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    No teachers match your search query &ldquo;{teacherSearchTerm}&rdquo;.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTeacherSearchTerm('')}
                  className="text-xs h-8 gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear Search Filter
                </Button>
              </Card>
            ) : loadingTeacher && !teacherSchedule ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
                <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span>Loading faculty timetable...</span>
                </div>
              </div>
            ) : (
              <TeacherScheduleGrid scheduleData={teacherSchedule} />
            )
          )}
        </TabsContent>

        {/* TAB 3: EXAM TIMETABLES & INVIGILATION */}
        <TabsContent value="exams" forceMount className="space-y-4 data-[state=inactive]:hidden">
          <div className="flex flex-col gap-3.5 rounded-lg border border-border/70 bg-card p-3.5 shadow-xs">
            {/* Top row: Title and Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Examination Date Sheets</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Filter by grade, term, section, and academic year to view subject papers and invigilation rosters.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Teacher button to list only duties, or Admin timetable tools */}
              <div className="flex flex-wrap items-center gap-2">
                {isTeacher && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setOnlyMyDuties(!onlyMyDuties)}
                    className={`h-8 text-xs gap-1.5 font-medium transition-all shadow-xs ${
                      onlyMyDuties
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold ring-2 ring-emerald-500/50'
                        : 'border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CalendarCheck className="h-3.5 w-3.5" />
                    <span>{onlyMyDuties ? 'Viewing: My Duties Only' : 'List Only My Exam Duties'}</span>
                    <Badge
                      variant="secondary"
                      className={`ml-0.5 text-[10px] px-1.5 py-0 h-4 ${
                        onlyMyDuties
                          ? 'bg-white text-emerald-800 font-bold'
                          : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                      }`}
                    >
                      {teacherDuties.length}
                    </Badge>
                  </Button>
                )}

                {isAdmin && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => setIsUnifiedExamModalOpen(true)}
                      className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Create Exam Timetable
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExamScheduleToEdit(null)
                        setIsExamModalOpen(true)
                      }}
                      disabled={!selectedExamId}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Single Session
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bottom row */}
            {!onlyMyDuties ? (
              /* When in standard date sheets mode */
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/40">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Grade Filter Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1 whitespace-nowrap">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" /> Grade:
                    </span>
                    <select
                      value={examGradeFilter}
                      onChange={(e) => {
                        const val = e.target.value
                        setExamGradeFilter(val)
                      }}
                      className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                    >
                      <option value="ALL">All Grades (1–13)</option>
                      {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
                        <option key={g} value={String(g)}>
                          Grade {g}
                        </option>
                      ))}
                      <option value="SCHOOL_WIDE">🌟 School-Wide Only</option>
                    </select>
                  </div>

                  {/* Term and Section Filters: HIDDEN when Grade is School-Wide Only */}
                  {examGradeFilter !== 'SCHOOL_WIDE' && (
                    <>
                      {/* Term Filter Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3.5 w-3.5 text-primary" /> Term:
                        </span>
                        <select
                          value={examTermFilter}
                          onChange={(e) => setExamTermFilter(e.target.value)}
                          className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                        >
                          <option value="ALL">All Terms</option>
                          <option value="TERM_1">Term 1</option>
                          <option value="TERM_2">Term 2</option>
                          <option value="TERM_3">Term 3</option>
                          <option value="OTHER">Other / Special</option>
                        </select>
                      </div>

                      {/* Section Filter Dropdown */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1 whitespace-nowrap">
                          <Users className="h-3.5 w-3.5 text-primary" /> Section:
                        </span>
                        <select
                          value={examSectionFilter}
                          onChange={(e) => setExamSectionFilter(e.target.value)}
                          disabled={examGradeFilter === 'ALL' || availableSections.length === 0}
                          className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium disabled:opacity-60"
                        >
                          <option value="ALL">
                            {examGradeFilter === 'ALL'
                              ? 'Select Grade first'
                              : availableSections.length === 0
                              ? 'No sections'
                              : 'All Sections'}
                          </option>
                          {availableSections.map((sec) => (
                            <option key={sec.id} value={String(sec.id)}>
                              {sec.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Year Filter Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Year:
                    </span>
                    <select
                      value={examYearFilter}
                      onChange={(e) => setExamYearFilter(e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                    >
                      <option value="ALL">All Years</option>
                      {availableExamYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Scope Summary Badge */}
                  {examGradeFilter === 'SCHOOL_WIDE' ? (
                    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] gap-1 py-1 font-medium">
                      <Sparkles className="h-3 w-3" />
                      School-Wide Date Sheets ({displayedExamSchedules.length} papers)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] gap-1 py-1 font-medium">
                      <GraduationCap className="h-3 w-3" />
                      {examGradeFilter === 'ALL' ? 'All Grades' : `Grade ${examGradeFilter}`}
                      {examTermFilter !== 'ALL' ? ` • ${examTermFilter.replace('TERM_', 'Term ')}` : ''}
                      {examSectionFilter !== 'ALL'
                        ? ` • Section ${classes.find((c) => String(c.id) === String(examSectionFilter))?.name || ''}`
                        : ''}
                      {` (${displayedExamSchedules.length} papers)`}
                    </Badge>
                  )}

                  {/* Informative indicator for teacher duties in this date sheet */}
                  {isTeacher && myDutiesInCurrentExam.length > 0 && (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs gap-1.5 py-1 font-medium"
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      You have {myDutiesInCurrentExam.length} assigned dut{myDutiesInCurrentExam.length === 1 ? 'y' : 'ies'} in this date sheet
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      examCache.current.clear()
                      fetchExamSchedules(filteredExams, true)
                      loadExams()
                    }}
                    disabled={loadingExams}
                    className="h-8 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1.5 ${loadingExams ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              /* When in onlyMyDuties mode: Title & Back toggle */
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs py-0.5 px-2 font-medium flex items-center gap-1.5">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Personal Invigilation View: {teacherDuties.length} session{teacherDuties.length === 1 ? '' : 's'} assigned
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    All examination invigilation duties assigned to you for Academic Year {academicYear}.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTeacherDuties}
                    disabled={loadingTeacherDuties}
                    className="h-8 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1.5 ${loadingTeacherDuties ? 'animate-spin' : ''}`} />
                    Refresh Duties
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOnlyMyDuties(false)}
                    className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Browse All Exam Date Sheets
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* SESSIONS LIST */}
          {onlyMyDuties ? (
            /* TEACHER PERSONAL DUTIES LIST */
            loadingTeacherDuties ? (
              <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-border bg-card">
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                  <span>Loading your assigned exam duties...</span>
                </div>
              </div>
            ) : teacherDuties.length === 0 ? (
              <Card className="border-dashed p-10 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mx-auto text-emerald-600">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">No Exam Duties Assigned</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    You currently do not have any invigilation or examination supervision duties assigned. Once the administration schedules you to an exam slot, it will appear here.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOnlyMyDuties(false)}
                  className="text-xs h-8 gap-1.5"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Browse School Date Sheets
                </Button>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {teacherDuties.map((duty) => {
                  const isChief =
                    (duty.invigilatorId && String(duty.invigilatorId) === String(userProfile?.id)) ||
                    (userProfile?.firstName && duty.invigilatorName?.toLowerCase().includes(userProfile.firstName.toLowerCase()))

                  return (
                    <Card key={duty.id} className="border-emerald-500/30 shadow-xs hover:shadow-md transition-shadow bg-card">
                      <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge className={isChief ? "bg-emerald-600 text-white text-xs font-semibold" : "bg-blue-600 text-white text-xs"}>
                              {isChief ? "Chief Invigilator" : "Assistant Invigilator"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {duty.className || "School-wide Cohort"}
                            </Badge>
                            {duty.term && (
                              <Badge variant="outline" className="text-[10px]">
                                {getExamTermLabel(duty.term)}{duty.academicYear ? ` (${duty.academicYear})` : ''}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {duty.examDate}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] text-muted-foreground font-medium truncate">
                            {duty.examName || "School Examination"}
                          </div>
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                            <span>{duty.subjectName || duty.customSubjectName || "Curriculum Session"}</span>
                            {duty.maxMarks && (
                              <span className="text-xs text-muted-foreground font-normal">
                                • Max Marks: {duty.maxMarks}
                              </span>
                            )}
                          </h4>
                        </div>

                        <div className="rounded-md bg-muted/40 p-2.5 text-xs space-y-1.5 border border-border/40">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              Time:
                            </span>
                            <strong className="text-foreground">{duty.startTime} – {duty.endTime}</strong>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Venue / Room:</span>
                            <strong className="text-foreground truncate max-w-[150px]">{duty.room || 'Classroom'}</strong>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Role:</span>
                            <strong className="text-foreground">{isChief ? "Lead Invigilator" : `Lead: ${duty.invigilatorName}`}</strong>
                          </div>
                          {isChief && duty.coInvigilatorName && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>Assistant:</span>
                              <strong className="text-foreground truncate max-w-[150px]">{duty.coInvigilatorName}</strong>
                            </div>
                          )}
                        </div>

                        {duty.instructions && (
                          <p className="text-[11px] text-muted-foreground italic border-l-2 border-emerald-500/40 pl-2">
                            {duty.instructions}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )
          ) : (
            /* STANDARD EXAM SCHEDULES LIST */
            loadingExams && displayedExamSchedules.length === 0 ? (
              <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-border bg-card">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredExams.length === 0 ? (
              <Card className="border-dashed p-10 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 mx-auto text-muted-foreground">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">No Examinations Found</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    {examGradeFilter !== 'ALL' && examGradeFilter !== 'SCHOOL_WIDE'
                      ? `No examinations match Grade ${examGradeFilter}${examYearFilter !== 'ALL' ? ` in Year ${examYearFilter}` : ''}. You can schedule a multi-subject exam timetable or reset the filters.`
                      : 'No examinations match your current filter selections.'}
                  </p>
                </div>
                <div className="flex justify-center items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setExamGradeFilter('ALL')
                      setExamTermFilter('ALL')
                      setExamSectionFilter('ALL')
                      setExamYearFilter('ALL')
                    }}
                    className="text-xs h-8"
                  >
                    Reset Filters
                  </Button>
                  {isAdmin && (
                    <Button
                      size="sm"
                      onClick={() => setIsUnifiedExamModalOpen(true)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Create Exam Timetable
                    </Button>
                  )}
                </div>
              </Card>
            ) : displayedExamSchedules.length === 0 ? (
              <Card className="border-dashed p-10 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 mx-auto text-amber-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {examGradeFilter === 'SCHOOL_WIDE' ? 'No School-Wide Date Sheet Sessions Found' : 'Exam Scheduled, But No Date Sheet Sessions Added Yet'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-lg mx-auto">
                    {examGradeFilter === 'SCHOOL_WIDE'
                      ? 'No sessions marked Open / School-wide match the selected academic year.'
                      : <>&ldquo;{selectedExam?.name}&rdquo;{selectedExam?.term ? ` (${getExamTermLabel(selectedExam.term)})` : ''} was created in the Examination Schedule, but individual subject papers (dates, times, venues, and invigilators) haven&apos;t been assigned to this date sheet yet.</>}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => setIsUnifiedExamModalOpen(true)}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Generate Multi-Subject Timetable
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setExamScheduleToEdit(null)
                        setIsExamModalOpen(true)
                      }}
                      className="text-xs h-8 gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      + Add Individual Paper / Session
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displayedExamSchedules.slice(0, visibleExamCount).map((item) => {
                  const isMyDuty = isTeacher && userProfile && (
                    (item.invigilatorId && String(item.invigilatorId) === String(userProfile.id)) ||
                    (item.coInvigilatorId && String(item.coInvigilatorId) === String(userProfile.id)) ||
                    (userProfile.firstName && item.invigilatorName && item.invigilatorName.toLowerCase().includes(userProfile.firstName.toLowerCase()))
                  )

                  return (
                    <Card key={item.id} className={`border-border/70 shadow-xs hover:shadow-md transition-shadow ${isMyDuty ? "ring-1 ring-emerald-500/40" : ""}`}>
                      <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant={item.classId ? "secondary" : "outline"}
                              className={`font-bold text-xs ${!item.classId ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400" : ""}`}
                            >
                              {item.className || 'School-wide'}
                            </Badge>
                            {item.term && (
                              <Badge variant="outline" className="text-[10px] font-medium">
                                {getExamTermLabel(item.term)}{item.academicYear ? ` (${item.academicYear})` : ''}
                              </Badge>
                            )}
                            {isMyDuty && (
                              <Badge className="bg-emerald-600 text-white text-[10px] py-0 px-1.5 font-medium">
                                Your Duty
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-primary">{item.examDate}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <span>{item.subjectName || item.customSubjectName || 'Assessment'}</span>
                            {(!item.subjectId || item.customSubjectName) && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-normal">
                                Custom
                              </Badge>
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground">{item.subjectCode && item.subjectCode !== 'OTHER' ? `${item.subjectCode} • ` : ''}Max Marks: {item.maxMarks}</p>
                        </div>

                        <div className="rounded-md bg-muted/40 p-2 text-xs space-y-1 border border-border/40">
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Time:</span>
                            <strong className="text-foreground">{item.startTime} – {item.endTime}</strong>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Venue:</span>
                            <strong className="text-foreground truncate max-w-[150px]">{item.room || 'Classroom'}</strong>
                          </div>
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Chief Invigilator:</span>
                            <strong className="text-foreground truncate max-w-[150px]">{item.invigilatorName}</strong>
                          </div>
                          {item.coInvigilatorName && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span>Assistant:</span>
                              <strong className="text-foreground truncate max-w-[150px]">{item.coInvigilatorName}</strong>
                            </div>
                          )}
                        </div>

                        {item.instructions && (
                          <p className="text-[11px] text-muted-foreground italic border-l-2 border-primary/40 pl-2">
                            {item.instructions}
                          </p>
                        )}

                        {isAdmin && (
                          <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setExamScheduleToEdit(item)
                                setIsExamModalOpen(true)
                              }}
                              className="h-7 text-xs px-2"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExamSlot(item.id)}
                              className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                </div>
                {displayedExamSchedules.length > visibleExamCount && (
                  <Button variant="outline" className="w-full" onClick={() => setVisibleExamCount((count) => count + 48)}>
                    Show more papers ({displayedExamSchedules.length - visibleExamCount} remaining)
                  </Button>
                )}
              </div>
            )
          )}
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      {isSlotModalOpen && (
        <TimetableSlotModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          onSaved={() => {
            classCache.current.clear()
            teacherCache.current.clear()
            fetchClassTimetable(selectedClassId, true)
          }}
          slotToEdit={slotToEdit}
          initialDay={initialDay}
          initialPeriod={initialPeriod}
          selectedClass={selectedClass}
          subjects={subjects}
          teachers={teachers}
          academicYear={academicYear}
          getToken={getToken}
        />
      )}

      {isAutoGeneratorOpen && (
        <AutoGeneratorModal
          isOpen={isAutoGeneratorOpen}
          onClose={() => setIsAutoGeneratorOpen(false)}
          onGenerated={() => {
            classCache.current.clear()
            teacherCache.current.clear()
            fetchClassTimetable(selectedClassId, true)
          }}
          selectedClass={selectedClass}
          academicYear={academicYear}
          getToken={getToken}
        />
      )}

      {isExamModalOpen && (
        <ExamScheduleModal
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          onSaved={() => {
            examCache.current.clear()
            fetchExamSchedules(filteredExams, true)
          }}
          scheduleToEdit={examScheduleToEdit}
          selectedExam={selectedExam}
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          rooms={campusRooms}
          getToken={getToken}
        />
      )}

      {isUnifiedExamModalOpen && (
        <ExamTimetableModal
          isOpen={isUnifiedExamModalOpen}
          onClose={() => setIsUnifiedExamModalOpen(false)}
          onSuccess={async () => {
            examCache.current.clear()
            try {
              const exList = await academicService.getExams({}, getToken)
              setExams(exList || [])
            } catch (e) {
              console.warn("Failed to refresh exams after timetable creation", e)
            }
          }}
          getToken={getToken}
          initialGrade={
            examGradeFilter !== 'ALL' && examGradeFilter !== 'SCHOOL_WIDE'
              ? Number(examGradeFilter)
              : selectedClass
              ? selectedClass.gradeLevel
              : 10
          }
          initialClassId={examSectionFilter === 'ALL' ? null : examSectionFilter}
          initialTerm={['TERM_1', 'TERM_2', 'TERM_3'].includes(examTermFilter) ? examTermFilter : 'TERM_1'}
          initialAcademicYear={examYearFilter === 'ALL' ? new Date().getFullYear() : Number(examYearFilter)}
        />
      )}


      {isPrintOpen && (
        <PrintableTimetable
          timetableData={isPrintTeacher ? teacherSchedule : classTimetable}
          isTeacherView={isPrintTeacher}
          onClose={() => setIsPrintOpen(false)}
        />
      )}
    </div>
  )
}
