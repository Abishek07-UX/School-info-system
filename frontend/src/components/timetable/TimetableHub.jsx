import { useState, useEffect, useCallback, useMemo } from 'react'
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
  ShieldAlert,
  ShieldCheck,
  Loader2,
  RefreshCw,
  BookOpen,
  Award,
  Sparkles,
  Search,
  X,
  Filter,
} from 'lucide-react'
import { timetableService } from '../../services/timetableService'
import { examScheduleService } from '../../services/examScheduleService'
import { academicService } from '../../services/academicService'
import { ClassTimetableGrid } from './ClassTimetableGrid'
import { TimetableSlotModal } from './TimetableSlotModal'
import { TeacherScheduleGrid } from './TeacherScheduleGrid'
import { ExamScheduleModal } from './ExamScheduleModal'
import { GeneralExamModal } from './GeneralExamModal'
import { AutoGeneratorModal } from './AutoGeneratorModal'
import { PrintableTimetable } from './PrintableTimetable'
import ExamTimetableModal from '../academic/ExamTimetableModal'

export function TimetableHub({ userRole = 'ADMIN', getToken }) {
  const isAdmin = userRole === 'ADMIN'

  const [activeTab, setActiveTab] = useState('classes')
  const [academicYear, setAcademicYear] = useState(2026)

  // Lookups
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [exams, setExams] = useState([])
  const [campusRooms, setCampusRooms] = useState([])

  // Selection states
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedExamId, setSelectedExamId] = useState('')
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('')

  // Data states
  const [classTimetable, setClassTimetable] = useState(null)
  const [teacherSchedule, setTeacherSchedule] = useState(null)
  const [examSchedules, setExamSchedules] = useState([])
  const [auditReport, setAuditReport] = useState(null)

  // Loading states
  const [loadingClass, setLoadingClass] = useState(false)
  const [loadingTeacher, setLoadingTeacher] = useState(false)
  const [loadingExams, setLoadingExams] = useState(false)
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  // Modals
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [slotToEdit, setSlotToEdit] = useState(null)
  const [initialDay, setInitialDay] = useState('MONDAY')
  const [initialPeriod, setInitialPeriod] = useState(1)

  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  const [isUnifiedExamModalOpen, setIsUnifiedExamModalOpen] = useState(false)
  const [isGeneralExamModalOpen, setIsGeneralExamModalOpen] = useState(false)
  const [examScheduleToEdit, setExamScheduleToEdit] = useState(null)

  const [isAutoGeneratorOpen, setIsAutoGeneratorOpen] = useState(false)
  const [isPrintOpen, setIsPrintOpen] = useState(false)
  const [isPrintTeacher, setIsPrintTeacher] = useState(false)

  // Initial Lookups
  useEffect(() => {
    async function loadLookups() {
      try {
        const [cls, tchs, subs, rlist] = await Promise.all([
          academicService.getClasses(getToken),
          timetableService.getTeachers(getToken),
          academicService.getAllSubjects(getToken),
          timetableService.getCampusRooms(getToken),
        ])

        setClasses(cls || [])
        setTeachers(tchs || [])
        setSubjects(subs || [])
        setCampusRooms(rlist || [])

        if (cls && cls.length > 0) {
          setSelectedClassId(cls[0].id)
        }
        if (tchs && tchs.length > 0) {
          setSelectedTeacherId(tchs[0].id)
        }
      } catch (err) {
        console.error('Failed to load initial timetable lookups:', err)
      }
    }
    loadLookups()
  }, [getToken])

  // Load Exams
  useEffect(() => {
    async function loadExams() {
      try {
        const examList = await academicService.getExams({ academicYear }, getToken)
        setExams(examList || [])
        if (examList && examList.length > 0) {
          setSelectedExamId(examList[0].id)
        }
      } catch (err) {
        console.error('Failed to load exams:', err)
      }
    }
    loadExams()
  }, [academicYear, getToken])

  // Fetch Class Timetable
  const fetchClassTimetable = useCallback(async () => {
    if (!selectedClassId) return
    setLoadingClass(true)
    setErrorMsg(null)
    try {
      const data = await timetableService.getClassTimetable(selectedClassId, academicYear, getToken)
      setClassTimetable(data)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load class timetable.')
    } finally {
      setLoadingClass(false)
    }
  }, [selectedClassId, academicYear, getToken])

  useEffect(() => {
    if (activeTab === 'classes' && selectedClassId) {
      fetchClassTimetable()
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

  // Fetch Teacher Timetable
  const fetchTeacherSchedule = useCallback(async () => {
    if (!selectedTeacherId) {
      setTeacherSchedule(null)
      return
    }
    setLoadingTeacher(true)
    setErrorMsg(null)
    try {
      const data = await timetableService.getTeacherSchedule(selectedTeacherId, academicYear, getToken)
      setTeacherSchedule(data)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load teacher schedule.')
    } finally {
      setLoadingTeacher(false)
    }
  }, [selectedTeacherId, academicYear, getToken])

  useEffect(() => {
    if (activeTab === 'teachers') {
      if (selectedTeacherId) {
        fetchTeacherSchedule()
      } else {
        setTeacherSchedule(null)
      }
    }
  }, [activeTab, selectedTeacherId, fetchTeacherSchedule])

  // Fetch Exam Schedules
  const fetchExamSchedules = useCallback(async () => {
    if (!selectedExamId) return
    setLoadingExams(true)
    setErrorMsg(null)
    try {
      const data = await examScheduleService.getExamSchedules(selectedExamId, getToken)
      setExamSchedules(data || [])
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load exam schedules.')
    } finally {
      setLoadingExams(false)
    }
  }, [selectedExamId, getToken])

  useEffect(() => {
    if (activeTab === 'exams' && selectedExamId) {
      fetchExamSchedules()
    }
  }, [activeTab, selectedExamId, fetchExamSchedules])

  // Run Conflict Audit
  const runAudit = async () => {
    setLoadingAudit(true)
    try {
      const report = await timetableService.auditSchoolTimetable(academicYear, getToken)
      setAuditReport(report)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to audit timetable.')
    } finally {
      setLoadingAudit(false)
    }
  }

  const handleClearClass = async () => {
    if (!window.confirm('Are you sure you want to clear this entire weekly timetable?')) return
    try {
      await timetableService.clearClassTimetable(selectedClassId, academicYear, getToken)
      fetchClassTimetable()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to clear class timetable.')
    }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this period slot?')) return
    try {
      await timetableService.deleteSlot(slotId, getToken)
      fetchClassTimetable()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete slot.')
    }
  }

  const handleDeleteExamSlot = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) return
    try {
      await examScheduleService.deleteExamSchedule(scheduleId, getToken)
      fetchExamSchedules()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete exam schedule.')
    }
  }

  const selectedClass = classes.find((c) => String(c.id) === String(selectedClassId))
  const selectedExam = exams.find((e) => String(e.id) === String(selectedExamId))

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
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="classes" className="flex items-center gap-1.5 text-xs">
            <GraduationCap className="h-3.5 w-3.5" />
            Class Timetables
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Teacher Schedules
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Exam Date Sheets
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            Conflict Inspector
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CLASS TIMETABLES */}
        <TabsContent value="classes" className="space-y-4">
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
                onClick={fetchClassTimetable}
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

          {loadingClass ? (
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
        <TabsContent value="teachers" className="space-y-4">
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
                  onClick={fetchTeacherSchedule}
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

          {filteredTeachers.length === 0 ? (
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
          ) : loadingTeacher ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card">
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>Loading faculty timetable...</span>
              </div>
            </div>
          ) : (
            <TeacherScheduleGrid scheduleData={teacherSchedule} />
          )}
        </TabsContent>

        {/* TAB 3: EXAM TIMETABLES & INVIGILATION */}
        <TabsContent value="exams" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card p-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-64">
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} {ex.className && !ex.className.toLowerCase().includes('school-wide') ? `(${ex.className})` : '(School-wide)'} • {ex.academicYear}
                    </option>
                  ))}
                </select>
              </div>

              {selectedExam && (!selectedExam.classId || selectedExam.term === 'OTHER') && (
                <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] gap-1 py-0.5 font-medium">
                  <Award className="h-3 w-3" />
                  School-wide / No Class
                </Badge>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={fetchExamSchedules}
                disabled={loadingExams}
                className="h-8 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1.5 ${loadingExams ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsGeneralExamModalOpen(true)}
                  className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  New General Exam
                </Button>

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
              </div>
            )}
          </div>

          {/* Exam Schedules List */}
          {loadingExams ? (
            <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-border bg-card">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : examSchedules.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-muted-foreground text-xs">
              No examination sessions scheduled for this exam yet.
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {examSchedules.map((item) => (
                <Card key={item.id} className="border-border/70 shadow-xs hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={item.classId ? "secondary" : "outline"}
                        className={`font-bold text-xs ${!item.classId ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400" : ""}`}
                      >
                        {item.className || 'School-wide'}
                      </Badge>
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
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: CONFLICT INSPECTOR */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    School-Wide Schedule Collision Scanner
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Analyzes all 39 classes and faculty assignments simultaneously to detect any teacher double-bookings or missing allocations.
                  </p>
                </div>
                <Button onClick={runAudit} disabled={loadingAudit} size="sm" className="gap-2">
                  {loadingAudit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  Run Timetable Audit
                </Button>
              </div>

              {auditReport && (
                <div className="space-y-4 pt-2">
                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-muted/40 p-3 border border-border/50 text-center">
                      <div className="text-xs text-muted-foreground">Total Classes</div>
                      <div className="text-lg font-bold text-foreground">{auditReport.totalClasses}</div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 border border-border/50 text-center">
                      <div className="text-xs text-muted-foreground">Assigned Slots</div>
                      <div className="text-lg font-bold text-foreground">{auditReport.totalAssignedSlots}</div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3 border border-border/50 text-center">
                      <div className="text-xs text-muted-foreground">Faculty Scheduled</div>
                      <div className="text-lg font-bold text-foreground">{auditReport.totalTeachersScheduled}</div>
                    </div>
                    <div className={`rounded-lg p-3 border text-center ${auditReport.isConflictFree ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'}`}>
                      <div className="text-xs">Clashes Found</div>
                      <div className="text-lg font-bold">{auditReport.totalConflictsFound}</div>
                    </div>
                  </div>

                  {auditReport.isConflictFree ? (
                    <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      <ShieldCheck className="h-6 w-6 shrink-0" />
                      <div>
                        <div className="font-bold text-sm">Perfect Status: 100% Conflict-Free!</div>
                        <div>Every teacher and class slot across all 39 classes is completely collision-free.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4" /> Detected Clashes ({auditReport.conflicts.length})
                      </h4>
                      <div className="space-y-2">
                        {auditReport.conflicts.map((c, i) => (
                          <Alert key={i} variant="destructive" className="py-2 text-xs">
                            <AlertDescription>{c.message}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}

                  {auditReport.unassignedClassSummaries?.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <h4 className="text-xs font-semibold text-muted-foreground">Unassigned Slots Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {auditReport.unassignedClassSummaries.map((msg, i) => (
                          <div key={i} className="rounded bg-muted/30 p-2 text-muted-foreground border border-border/40">
                            {msg}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      {isSlotModalOpen && (
        <TimetableSlotModal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          onSaved={fetchClassTimetable}
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
          onGenerated={fetchClassTimetable}
          selectedClass={selectedClass}
          academicYear={academicYear}
          getToken={getToken}
        />
      )}

      {isExamModalOpen && (
        <ExamScheduleModal
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          onSaved={fetchExamSchedules}
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
            try {
              const exList = await academicService.getExams({ academicYear }, getToken)
              setExams(exList || [])
              if (exList && exList.length > 0) {
                setSelectedExamId(String(exList[0].id))
              }
            } catch (e) {
              console.warn("Failed to refresh exams after timetable creation", e)
            }
          }}
          getToken={getToken}
          initialGrade={selectedClass ? selectedClass.gradeLevel : 10}
        />
      )}

      {isGeneralExamModalOpen && (
        <GeneralExamModal
          isOpen={isGeneralExamModalOpen}
          onClose={() => setIsGeneralExamModalOpen(false)}
          onSuccess={async (createdExam) => {
            try {
              const exList = await academicService.getExams({ academicYear }, getToken)
              setExams(exList || [])
              if (createdExam?.id) {
                setSelectedExamId(String(createdExam.id))
              } else if (exList && exList.length > 0) {
                setSelectedExamId(String(exList[0].id))
              }
            } catch (e) {
              console.warn("Failed to refresh exams after general exam creation", e)
            }
          }}
          getToken={getToken}
          initialAcademicYear={academicYear}
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
