import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ShieldCheck,
  CheckSquare,
  Square,
  HelpCircle
} from "lucide-react"
import { academicService } from "@/services/academicService"
import { timetableService } from "@/services/timetableService"
import { examScheduleService } from "@/services/examScheduleService"

const TERMS = [
  { value: "TERM_1", label: "Term 1 (First Term Examination)" },
  { value: "TERM_2", label: "Term 2 (Mid-Year Examination)" },
  { value: "TERM_3", label: "Term 3 (Final Examination)" },
]

const parseDate = (dStr) => {
  if (!dStr) return null
  const parts = dStr.split("-").map(Number)
  if (parts.length !== 3) return null
  return new Date(parts[0], parts[1] - 1, parts[2])
}

const formatDate = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function ExamTimetableModal({
  isOpen,
  onClose,
  onSuccess,
  getToken,
  initialGrade = 10,
  examToEdit = null,
  classes = [],
}) {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear())
  const [term, setTerm] = useState("TERM_1")
  const [gradeLevel, setGradeLevel] = useState(initialGrade)
  const [examName, setExamName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")
  const [includeWeekends, setIncludeWeekends] = useState(true)

  // Loaded data
  const [availableClasses, setAvailableClasses] = useState([])
  const [selectedClassIds, setSelectedClassIds] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [slots, setSlots] = useState([])

  // States
  const [loadingData, setLoadingData] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [isNameCustomized, setIsNameCustomized] = useState(false)

  // Default suggested exam name
  const termLabel = useMemo(() => {
    return TERMS.find((t) => t.value === term)?.label?.split(" ")[0] || "Term 1"
  }, [term])

  // Sync default exam name if user hasn't manually typed a custom one (only in create mode)
  useEffect(() => {
    if (!isNameCustomized && !examToEdit) {
      setExamName(`Grade ${gradeLevel} ${termLabel} Examination ${academicYear}`)
    }
  }, [gradeLevel, termLabel, academicYear, isNameCustomized, examToEdit])

  // Load teachers on mount
  useEffect(() => {
    if (!isOpen) return
    const fetchTeachers = async () => {
      try {
        const teachersData = await timetableService.getTeachers(getToken)
        setTeachers(teachersData || [])
      } catch (err) {
        console.warn("Failed to load teachers lookup", err)
      }
    }
    fetchTeachers()
  }, [isOpen, getToken])

  // Set initial default dates or prefill from examToEdit
  useEffect(() => {
    if (!isOpen) return
    if (examToEdit) {
      setAcademicYear(examToEdit.academicYear || new Date().getFullYear())
      setTerm(examToEdit.term || "TERM_1")
      let grade = examToEdit.gradeLevel
      if (!grade && examToEdit.classId && classes?.length) {
        const matchingClass = classes.find((c) => c.id === examToEdit.classId)
        if (matchingClass?.gradeLevel) grade = matchingClass.gradeLevel
      }
      setGradeLevel(grade || initialGrade || 10)
      setExamName(examToEdit.name || "")
      setStartDate(examToEdit.startDate || "")
      setEndDate(examToEdit.endDate || "")
      setDescription(examToEdit.description || "")
      setIsNameCustomized(true)
    } else {
      setAcademicYear(new Date().getFullYear())
      setTerm("TERM_1")
      setGradeLevel(initialGrade || 10)
      setIsNameCustomized(false)
      setDescription("")
      const today = new Date()
      const nextMon = new Date(today)
      const day = today.getDay()
      const diffToMon = day === 0 ? 1 : 8 - day
      nextMon.setDate(today.getDate() + diffToMon)
      const endDefault = new Date(nextMon)
      endDefault.setDate(nextMon.getDate() + 13)
      setStartDate(formatDate(nextMon))
      setEndDate(formatDate(endDefault))
    }
  }, [isOpen, examToEdit, initialGrade, classes])

  // Load classes, subjects, and existing timetable slots whenever gradeLevel or examToEdit changes
  const loadGradeData = useCallback(async () => {
    if (!isOpen) return
    try {
      setLoadingData(true)
      setErrorMsg(null)

      const [classesData, subjectsData, existingSchedulesData] = await Promise.all([
        academicService.getClassesForGrade(gradeLevel, getToken),
        academicService.getSubjectsForGrade(gradeLevel, getToken),
        examToEdit?.id ? examScheduleService.getExamSchedules(examToEdit.id, getToken) : Promise.resolve([]),
      ])

      const validClasses = classesData || []
      const validSubjects = subjectsData || []
      const existingSchedules = existingSchedulesData || []

      setAvailableClasses(validClasses)
      if (examToEdit?.classId) {
        setSelectedClassIds([examToEdit.classId])
      } else {
        setSelectedClassIds(validClasses.map((c) => c.id))
      }
      setSubjects(validSubjects)

      const isEditing = Boolean(examToEdit)
      const schedMap = new Map()
      existingSchedules.forEach((s) => {
        if (s.subjectId) schedMap.set(s.subjectId, s)
      })

      // Initialize subject slots
      const initialSlots = validSubjects.map((sub) => {
        const existing = isEditing ? schedMap.get(sub.id) : null
        if (existing) {
          return {
            subjectId: sub.id,
            subjectName: sub.name,
            subjectCode: sub.code,
            included: true,
            examDate: existing.examDate || "",
            startTime: existing.startTime ? existing.startTime.substring(0, 5) : "08:30",
            endTime: existing.endTime ? existing.endTime.substring(0, 5) : "11:30",
            maxMarks: existing.maxMarks != null ? existing.maxMarks : 100,
            invigilatorId: existing.invigilatorId ? String(existing.invigilatorId) : "",
            instructions: existing.instructions || "Bring standard examination supplies. Calculators only if permitted.",
          }
        }
        return {
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          included: !isEditing, // in edit mode, unchecked if not previously scheduled
          examDate: "",
          startTime: "08:30",
          endTime: "11:30",
          maxMarks: 100,
          invigilatorId: "",
          instructions: "Bring standard examination supplies. Calculators only if permitted.",
        }
      })

      // Append any custom subjects present in existingSchedules but not in standard curriculum
      if (isEditing) {
        const validSubjectIds = new Set(validSubjects.map((s) => s.id))
        existingSchedules.forEach((s) => {
          if (s.subjectId && !validSubjectIds.has(s.subjectId)) {
            initialSlots.push({
              subjectId: s.subjectId,
              subjectName: s.subjectName || s.customSubjectName || "Custom Subject",
              subjectCode: s.subjectCode || "",
              included: true,
              examDate: s.examDate || "",
              startTime: s.startTime ? s.startTime.substring(0, 5) : "08:30",
              endTime: s.endTime ? s.endTime.substring(0, 5) : "11:30",
              maxMarks: s.maxMarks != null ? s.maxMarks : 100,
              invigilatorId: s.invigilatorId ? String(s.invigilatorId) : "",
              instructions: s.instructions || "",
            })
          }
        })
      }

      setSlots(initialSlots)
    } catch (err) {
      setErrorMsg(err.message || "Failed to load grade curriculum subjects or classes.")
    } finally {
      setLoadingData(false)
    }
  }, [gradeLevel, isOpen, getToken, examToEdit])

  useEffect(() => {
    loadGradeData()
  }, [loadGradeData])

  // Auto-distribute subject dates across the date range (supporting Saturdays and Sundays)
  const handleAutoDistributeDates = useCallback(() => {
    if (!startDate || !endDate) {
      setErrorMsg("Please select both Start Date and End Date first.")
      return
    }

    const start = parseDate(startDate)
    const end = parseDate(endDate)

    if (start > end) {
      setErrorMsg("Start date cannot be after end date.")
      return
    }

    // Collect all valid dates in range
    const availableDates = []
    const current = new Date(start)
    while (current <= end) {
      const dayOfWeek = current.getDay()
      if (includeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        availableDates.push(formatDate(current))
      }
      current.setDate(current.getDate() + 1)
    }

    if (availableDates.length === 0) {
      // Fallback: collect all days if filtered out
      const cur = new Date(start)
      while (cur <= end) {
        availableDates.push(formatDate(cur))
        cur.setDate(cur.getDate() + 1)
      }
    }

    let dateIndex = 0
    setSlots((prevSlots) =>
      prevSlots.map((slot) => {
        if (!slot.included) return slot
        const assignedDate = availableDates[dateIndex % availableDates.length]
        dateIndex++
        return {
          ...slot,
          examDate: assignedDate,
        }
      })
    )
    setErrorMsg(null)
  }, [startDate, endDate, includeWeekends])

  // Run auto-distribute once subjects and dates are initially set up (create mode only)
  useEffect(() => {
    if (!examToEdit && slots.length > 0 && startDate && endDate && slots.some((s) => !s.examDate)) {
      handleAutoDistributeDates()
    }
  }, [slots.length, startDate, endDate, handleAutoDistributeDates, examToEdit])

  // Toggle single class
  const handleToggleClass = (classId) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    )
  }

  // Toggle all classes
  const handleToggleAllClasses = () => {
    if (selectedClassIds.length === availableClasses.length) {
      setSelectedClassIds([])
    } else {
      setSelectedClassIds(availableClasses.map((c) => c.id))
    }
  }

  // Update specific field in a subject slot
  const handleSlotChange = (index, field, value) => {
    setSlots((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })

    // If changing examDate, dynamically expand examination date range if needed
    if (field === "examDate" && value) {
      if (!startDate || value < startDate) {
        setStartDate(value)
      }
      if (!endDate || value > endDate) {
        setEndDate(value)
      }
      setErrorMsg(null)
    }
  }

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (selectedClassIds.length === 0) {
      setErrorMsg("Please select at least one class to schedule.")
      return
    }

    if (!startDate || !endDate) {
      setErrorMsg("Please specify both the start and end dates of the examination.")
      return
    }

    const includedSlots = slots.filter((s) => s.included)
    if (includedSlots.length === 0) {
      setErrorMsg("Please include at least one subject in the exam timetable.")
      return
    }

    // Validate that each included slot has a valid date and times
    for (const slot of includedSlots) {
      if (!slot.examDate) {
        setErrorMsg(`Please specify an exam date for ${slot.subjectName}.`)
        return
      }
      if (!slot.startTime || !slot.endTime || slot.startTime >= slot.endTime) {
        setErrorMsg(`Please check start and end times for ${slot.subjectName}. Start time must be before end time.`)
        return
      }
    }

    // Determine the overall bounding dates covering all included slots
    const slotDates = includedSlots.map((s) => s.examDate).filter(Boolean)
    let effectiveStartDate = startDate
    let effectiveEndDate = endDate

    slotDates.forEach((d) => {
      if (!effectiveStartDate || d < effectiveStartDate) effectiveStartDate = d
      if (!effectiveEndDate || d > effectiveEndDate) effectiveEndDate = d
    })

    if (effectiveStartDate > effectiveEndDate) {
      effectiveEndDate = effectiveStartDate
    }

    const payload = {
      name: examName.trim(),
      academicYear: parseInt(academicYear, 10),
      term,
      gradeLevel: parseInt(gradeLevel, 10),
      classIds: selectedClassIds,
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      status: examToEdit?.status || "UPCOMING",
      description: description.trim() || undefined,
      slots: includedSlots.map((s) => ({
        subjectId: s.subjectId,
        examDate: s.examDate,
        startTime: s.startTime + (s.startTime.length === 5 ? ":00" : ""),
        endTime: s.endTime + (s.endTime.length === 5 ? ":00" : ""),
        invigilatorId: s.invigilatorId ? parseInt(s.invigilatorId, 10) : null,
        maxMarks: parseInt(s.maxMarks || 100, 10),
        instructions: s.instructions?.trim() || null,
      })),
    }

    try {
      setSubmitting(true)
      let res
      if (examToEdit?.id) {
        res = await academicService.updateExamWithTimetable(examToEdit.id, payload, getToken)
      } else {
        res = await academicService.createExamWithTimetable(payload, getToken)
      }
      if (onSuccess) onSuccess(res)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || (examToEdit ? "Failed to update examination timetable." : "Failed to create examination timetable."))
    } finally {
      setSubmitting(false)
    }
  }

  // Selected class names for badge display
  const selectedClassNames = availableClasses
    .filter((c) => selectedClassIds.includes(c.id))
    .map((c) => c.name)

  const includedCount = slots.filter((s) => s.included).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0 border-border/70 bg-card text-card-foreground shadow-2xl">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border/70 bg-muted/20">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {examToEdit ? "Edit Examination Timetable" : "Unified Examination Timetable Creator"}
                </DialogTitle>
              </div>
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/40 text-primary">
                {examToEdit ? "Editing Timetable" : "Multi-Class Scheduling"}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {examToEdit
                ? "Modify examination dates, subjects, timings, and invigilator assignments for this scheduled examination."
                : "Configure term, grade, date range, and subject exam dates in one place. Exams take place in each class's respective home classroom."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Scheduling Error</AlertTitle>
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl border border-border/60 bg-muted/10">
            {/* Term */}
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-semibold text-foreground">Evaluation Term *</Label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {TERMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-semibold text-foreground">Academic Year *</Label>
              <Input
                type="number"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                min="2020"
                max="2035"
                className="h-8 text-xs bg-background"
                required
              />
            </div>

            {/* Grade Level Selector */}
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-semibold text-foreground">Target Grade *</Label>
              <select
                value={gradeLevel}
                onChange={(e) => {
                  setGradeLevel(parseInt(e.target.value, 10))
                  setIsNameCustomized(false)
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-bold text-primary shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Overall Exam Title */}
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs font-semibold text-foreground">Exam Name / Title</Label>
              <Input
                type="text"
                value={examName}
                onChange={(e) => {
                  setExamName(e.target.value)
                  setIsNameCustomized(true)
                }}
                placeholder="e.g. Grade 10 First Term Examination"
                className="h-8 text-xs bg-background"
                required
              />
            </div>
          </div>

          {/* Section 2: Multi-Class Selection & Classroom Allocation Info */}
          <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-muted/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  Select Classes for Grade {gradeLevel} ({selectedClassIds.length} of {availableClasses.length} selected)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToggleAllClasses}
                className="h-7 text-xs text-primary hover:text-primary"
              >
                {selectedClassIds.length === availableClasses.length ? "Deselect All" : "Select All Classes"}
              </Button>
            </div>

            {loadingData ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Loading classes for Grade {gradeLevel}...
              </div>
            ) : availableClasses.length === 0 ? (
              <div className="text-xs text-muted-foreground italic py-2">
                No classes registered under Grade {gradeLevel}. Please add classes in Class Management.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {availableClasses.map((sc) => {
                  const isChecked = selectedClassIds.includes(sc.id)
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleToggleClass(sc.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isChecked
                          ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/40"
                          : "border-border/70 bg-background text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>Class {sc.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">({sc.capacity || 40} seats)</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Room Allocation Info Banner */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs">
              <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Respective Classroom Allocation:</strong> Exams will be held simultaneously in each class&apos;s assigned classroom:{" "}
                {selectedClassNames.length > 0 ? (
                  <span className="font-mono font-semibold">
                    {selectedClassNames.map((name) => `${name}`).join(", ")}
                  </span>
                ) : (
                  <span>(no classes selected)</span>
                )}
                . Manual hall allocation has been removed to streamline scheduling.
              </div>
            </div>
          </div>

          {/* Section 3: Exam Date Range & Auto-Distribute Toolbar */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Examination Date Range</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none bg-background border border-border/60 px-2.5 py-1 rounded-md">
                  <input
                    type="checkbox"
                    checked={includeWeekends}
                    onChange={(e) => setIncludeWeekends(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="text-[11px] text-foreground font-medium">Include Weekends (Sat &amp; Sun)</span>
                </label>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAutoDistributeDates}
                  disabled={!startDate || !endDate}
                  className="h-7 text-xs gap-1.5 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  Auto-Distribute Dates
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Start Date *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 text-xs bg-background"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">End Date *</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="h-8 text-xs bg-background"
                  required
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Tip: You can schedule subjects on any day (including Saturdays and Sundays). The exam date range automatically expands to cover all selected subject dates.
            </p>
          </div>

          {/* Section 4: Subject Timetable Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Grade {gradeLevel} Curriculum Subjects ({includedCount} included)
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                Set individual dates, session times, and invigilators
              </span>
            </div>

            {loadingData ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary mb-2" />
                Loading curriculum subjects for Grade {gradeLevel}...
              </div>
            ) : slots.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                No curriculum subjects found for Grade {gradeLevel}.
              </div>
            ) : (
              <div className="rounded-xl border border-border/70 overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 text-muted-foreground font-semibold sticky top-0 z-10 border-b border-border/70">
                      <tr>
                        <th className="p-2.5 w-10 text-center">Inc.</th>
                        <th className="p-2.5 min-w-[160px]">Subject</th>
                        <th className="p-2.5 min-w-[170px]">Exam Date</th>
                        <th className="p-2.5 min-w-[105px]">Start</th>
                        <th className="p-2.5 min-w-[105px]">End</th>
                        <th className="p-2.5 min-w-[70px]">Marks</th>
                        <th className="p-2.5 min-w-[160px]">Invigilator</th>
                        <th className="p-2.5 min-w-[120px]">Venue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {slots.map((slot, idx) => (
                        <tr
                          key={slot.subjectId}
                          className={`transition-colors ${
                            slot.included ? "hover:bg-muted/30 bg-card" : "bg-muted/15 opacity-55"
                          }`}
                        >
                          {/* Included checkbox */}
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={slot.included}
                              onChange={(e) => handleSlotChange(idx, "included", e.target.checked)}
                              className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                          </td>

                          {/* Subject Code & Name */}
                          <td className="p-2.5">
                            <div className="font-semibold text-foreground">{slot.subjectName}</div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {slot.subjectCode}
                            </span>
                          </td>

                          {/* Exam Date */}
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="date"
                                value={slot.examDate}
                                onChange={(e) => handleSlotChange(idx, "examDate", e.target.value)}
                                disabled={!slot.included}
                                className="h-7 text-xs bg-background py-0.5 px-2 min-w-[125px]"
                                required={slot.included}
                              />
                              {slot.examDate && (() => {
                                const dt = parseDate(slot.examDate)
                                if (!dt) return null
                                const isWeekend = dt.getDay() === 0 || dt.getDay() === 6
                                const dayName = dt.toLocaleDateString("en-US", { weekday: "short" })
                                return (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 h-5 font-medium shrink-0 ${
                                      isWeekend
                                        ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                                        : "text-muted-foreground border-border/50"
                                    }`}
                                  >
                                    {dayName}
                                  </Badge>
                                )
                              })()}
                            </div>
                          </td>

                          {/* Start Time */}
                          <td className="p-2.5">
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleSlotChange(idx, "startTime", e.target.value)}
                              disabled={!slot.included}
                              className="h-7 text-xs bg-background py-0.5 px-2"
                              required={slot.included}
                            />
                          </td>

                          {/* End Time */}
                          <td className="p-2.5">
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleSlotChange(idx, "endTime", e.target.value)}
                              disabled={!slot.included}
                              className="h-7 text-xs bg-background py-0.5 px-2"
                              required={slot.included}
                            />
                          </td>

                          {/* Max Marks */}
                          <td className="p-2.5">
                            <Input
                              type="number"
                              value={slot.maxMarks}
                              onChange={(e) => handleSlotChange(idx, "maxMarks", e.target.value)}
                              min="10"
                              max="200"
                              disabled={!slot.included}
                              className="h-7 text-xs bg-background py-0.5 px-1.5 w-16"
                            />
                          </td>

                          {/* Invigilator Dropdown */}
                          <td className="p-2.5">
                            <select
                              value={slot.invigilatorId}
                              onChange={(e) => handleSlotChange(idx, "invigilatorId", e.target.value)}
                              disabled={!slot.included}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                              <option value="">Default (Class Teacher)</option>
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.firstName} {t.lastName}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Venue badge */}
                          <td className="p-2.5">
                            <Badge
                              variant="secondary"
                              className="text-[10px] font-medium text-muted-foreground whitespace-nowrap"
                            >
                              Classrooms
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/70 bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {examToEdit ? (
              <>
                Editing timetable for{" "}
                <strong className="text-foreground">{selectedClassIds.length} classes</strong> with{" "}
                <strong className="text-foreground">{includedCount} subjects</strong>
              </>
            ) : (
              <>
                Scheduling for{" "}
                <strong className="text-foreground">{selectedClassIds.length} classes</strong> with{" "}
                <strong className="text-foreground">{includedCount} subjects</strong>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || selectedClassIds.length === 0 || includedCount === 0}
              className="gap-1.5 shadow-md shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {examToEdit ? "Updating Timetable..." : "Creating Exam Timetable..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {examToEdit ? "Save & Update Timetable" : `Create Exam Timetable (${selectedClassIds.length} Classes)`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
