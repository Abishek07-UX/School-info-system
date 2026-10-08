import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { academicService } from "@/services/academicService"
import { useAuthUser } from "@/context/AuthUserContext"
import { useToast } from "@/context/ToastContext"
import { useConfirm } from "@/context/ConfirmContext"
import { useBlocker } from "@/lib/router"
import { calculateGrade } from "@/lib/grades"
import { shake, flash } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { FilterBar, FilterField } from "@/components/ui/filter-bar"
import { TableEmptyRow } from "@/components/ui/empty-state"
import { GradeBadge } from "./GradeBadge"
import { Eye, Save, Users, CheckCircle2, Undo2, Keyboard, CalendarX } from "lucide-react"

const TERM_LABELS = {
  TERM_1: "Term 1 Examination",
  TERM_2: "Term 2 Examination",
  TERM_3: "Term 3 Examination",
}

const EMPTY_ENTRY = { score: "", remarks: "", grade: null }

const isOutOfRange = (score) => score !== "" && score !== undefined && (parseFloat(score) < 0 || parseFloat(score) > 100)

export default function BatchMarkEntryTab({ classes = [], preselectedExam }) {
  const { getToken, userProfile, role, isAdmin, isPrincipal } = useAuthUser()
  const toast = useToast()
  const confirm = useConfirm()

  // Find if teacher has an assigned class
  const assignedClass = userProfile?.id
    ? classes.find((c) => String(c.classTeacherId) === String(userProfile.id)) || null
    : null

  const [selectedClassId, setSelectedClassId] = useState(
    preselectedExam?.classId
      ? String(preselectedExam.classId)
      : assignedClass?.id
      ? String(assignedClass.id)
      : classes.length > 0
      ? String(classes[0].id)
      : ""
  )

  const [exams, setExams] = useState([])
  const [selectedExamId, setSelectedExamId] = useState(
    preselectedExam ? String(preselectedExam.id) : ""
  )
  const [subjects, setSubjects] = useState([])
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [students, setStudents] = useState([])
  const [studentMarks, setStudentMarks] = useState({}) // studentId -> { score, remarks, grade }
  const [savedMarks, setSavedMarks] = useState({}) // last loaded/saved values, for change tracking
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterYear, setFilterYear] = useState(
    String(preselectedExam?.academicYear || new Date().getFullYear())
  )
  const manuallySelectedClass = useRef(false)
  const gridRef = useRef(null)
  const selectedClass = classes.find((c) => String(c.id) === String(selectedClassId))
  const isAssignedClass = Boolean(role === "TEACHER" && userProfile?.id &&
    String(selectedClass?.classTeacherId) === String(userProfile.id))
  const canEditMarks = isAdmin || (role === "TEACHER" && isAssignedClass)

  // Prefer the teacher's class even when the profile arrives after the class list.
  useEffect(() => {
    if (preselectedExam?.classId || manuallySelectedClass.current || classes.length === 0) return
    const preferredClass = role === "TEACHER" ? assignedClass : null
    const defaultClassId = String((preferredClass || classes[0]).id)
    setSelectedClassId((current) => current === defaultClassId ? current : defaultClassId)
  }, [classes, assignedClass, role, preselectedExam?.classId])

  // Load all exams for the selected year
  useEffect(() => {
    async function loadExams() {
      try {
        const data = await academicService.getExams(
          { academicYear: parseInt(filterYear, 10) },
          getToken
        )
        setExams(data || [])
      } catch (err) {
        console.error("Failed to load exams:", err)
      }
    }
    loadExams()
  }, [filterYear, getToken])

  // Show one mark-entry choice per term. Keep the class-specific record as its
  // value so marks are saved against the selected class's exam.
  const relevantExams = useMemo(() => {
    if (!selectedClassId) return []

    const byTerm = new Map()
    for (const exam of exams) {
      if (!Object.hasOwn(TERM_LABELS, exam.term)) continue
      if (String(exam.academicYear) !== filterYear) continue
      if (exam.classId && String(exam.classId) !== String(selectedClassId)) continue

      const previous = byTerm.get(exam.term)
      if (!previous || (!previous.classId && exam.classId)) {
        byTerm.set(exam.term, exam)
      }
    }
    return Object.keys(TERM_LABELS).map((term) => byTerm.get(term)).filter(Boolean)
  }, [exams, selectedClassId, filterYear])

  const activeExamId = relevantExams.some((exam) => String(exam.id) === selectedExamId)
    ? selectedExamId
    : relevantExams.length > 0 ? String(relevantExams[0].id) : ""

  // Sync the stored selection when the class, year, or available exams change.
  useEffect(() => {
    if (selectedExamId !== activeExamId) setSelectedExamId(activeExamId)
  }, [activeExamId, selectedExamId])

  // Load subjects and students when selected class changes
  useEffect(() => {
    if (!selectedClassId) return

    async function loadClassData() {
      try {
        setLoading(true)
        const [subs, studs] = await Promise.all([
          academicService.getSubjectsForClass(selectedClassId, getToken),
          academicService.getStudentsForClass(selectedClassId, getToken),
        ])
        setSubjects(subs || [])
        setStudents(studs || [])
        if (subs && subs.length > 0) {
          setSelectedSubjectId(String(subs[0].id))
        } else {
          setSelectedSubjectId("")
        }
      } catch (err) {
        toast.error(err.message || "Failed to load class curriculum and students.")
      } finally {
        setLoading(false)
      }
    }
    loadClassData()
  }, [selectedClassId, getToken, toast])

  // Load existing marks for the selected term exam and subject.
  const loadExistingMarks = useCallback(async () => {
    if (!activeExamId || !selectedSubjectId) {
      setStudentMarks({})
      setSavedMarks({})
      return
    }
    try {
      setLoading(true)
      const marksData = await academicService.getMarksForExamAndSubject(
        activeExamId,
        selectedSubjectId,
        getToken
      )
      const markMap = {}
      if (marksData && marksData.length > 0) {
        marksData.forEach((m) => {
          markMap[m.studentId] = {
            score: m.score !== null ? m.score.toString() : "",
            remarks: m.remarks || "",
            grade: m.grade || calculateGrade(m.score),
          }
        })
      }
      setStudentMarks(markMap)
      setSavedMarks(markMap)
    } catch (err) {
      console.error("Failed to load marks:", err)
    } finally {
      setLoading(false)
    }
  }, [activeExamId, selectedSubjectId, getToken])

  useEffect(() => {
    loadExistingMarks()
  }, [loadExistingMarks])

  // ---- change tracking
  const changedIds = useMemo(() => {
    const ids = new Set()
    for (const student of students) {
      const now = studentMarks[student.id] || EMPTY_ENTRY
      const before = savedMarks[student.id] || EMPTY_ENTRY
      if ((now.score ?? "") !== (before.score ?? "") || (now.remarks ?? "") !== (before.remarks ?? "")) {
        ids.add(student.id)
      }
    }
    return ids
  }, [students, studentMarks, savedMarks])
  const hasChanges = canEditMarks && changedIds.size > 0

  useBlocker(hasChanges, () =>
    confirm({
      title: "Leave without saving?",
      description: `You have ${changedIds.size} unsaved ${changedIds.size === 1 ? "mark" : "marks"}. They'll be lost if you leave this page.`,
      confirmLabel: "Discard changes",
      cancelLabel: "Keep editing",
      tone: "danger",
    })
  )

  // Changing class / exam / subject reloads the roster, so check before throwing edits away
  const guardedChange = async (event, apply) => {
    const value = event.target.value
    if (hasChanges) {
      const ok = await confirm({
        title: "Discard unsaved marks?",
        description: "Switching the class, exam or subject reloads the roster and drops your unsaved edits.",
        confirmLabel: "Discard and switch",
        cancelLabel: "Keep editing",
        tone: "danger",
      })
      if (!ok) return
    }
    apply(value)
  }

  const selectClass = (value) => {
    manuallySelectedClass.current = true
    setSelectedClassId(value)
  }

  const handleScoreChange = (studentId, rawValue) => {
    if (!canEditMarks) return
    const grade = calculateGrade(rawValue)
    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...EMPTY_ENTRY,
        ...prev[studentId],
        score: rawValue,
        grade,
      },
    }))
  }

  const handleRemarksChange = (studentId, rawValue) => {
    if (!canEditMarks) return
    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...EMPTY_ENTRY,
        ...prev[studentId],
        remarks: rawValue,
      },
    }))
  }

  const discardChanges = () => setStudentMarks(savedMarks)

  // Spreadsheet-style movement: Enter / ↓ next student, ↑ previous student, same column
  const handleGridKeyDown = (event) => {
    const input = event.target
    const row = Number(input.dataset.row)
    const col = input.dataset.col
    if (Number.isNaN(row) || !col) return
    let target = null
    if (event.key === "Enter" || event.key === "ArrowDown") target = row + 1
    else if (event.key === "ArrowUp") target = row - 1
    if (target === null) return
    event.preventDefault()
    const next = gridRef.current?.querySelector(`input[data-row="${target}"][data-col="${col}"]`)
    if (next) {
      next.focus()
      next.select?.()
    }
  }

  const handleSaveAll = async () => {
    if (!canEditMarks) {
      toast.error("Only the assigned class teacher can edit these marks.")
      return
    }
    if (!activeExamId || !selectedSubjectId) {
      toast.error("Please choose an examination and curriculum subject.")
      return
    }

    const invalidStudent = students.find((s) => isOutOfRange(studentMarks[s.id]?.score))
    if (invalidStudent) {
      const inputs = gridRef.current?.querySelectorAll('input[aria-invalid="true"]') || []
      inputs.forEach((el) => shake(el))
      inputs[0]?.focus()
      toast.error(`Invalid score for ${invalidStudent.fullName}. Marks must be between 0 and 100.`)
      return
    }

    const items = []
    for (const student of students) {
      const entry = studentMarks[student.id]
      if (entry && entry.score !== "" && !isNaN(entry.score)) {
        items.push({
          studentId: student.id,
          score: parseFloat(entry.score),
          remarks: entry.remarks || "",
        })
      }
    }

    if (items.length === 0) {
      toast.error("No valid student marks entered to save.")
      return
    }

    const savedIds = [...changedIds]
    try {
      setSaving(true)
      const res = await academicService.enterBatchMarks(
        {
          examId: parseInt(activeExamId, 10),
          subjectId: parseInt(selectedSubjectId, 10),
          marks: items,
        },
        getToken
      )

      toast.success(`Successfully recorded evaluation marks for ${res.savedCount || items.length} students!`)
      setSavedMarks(studentMarks)
      // Confirm visually which rows were written
      savedIds.forEach((id) => {
        const rowEl = gridRef.current?.querySelector(`tr[data-student-id="${id}"]`)
        if (rowEl) flash(rowEl)
      })
      loadExistingMarks()
    } catch (err) {
      toast.error(err.message || "Failed to save batch marks.")
    } finally {
      setSaving(false)
    }
  }

  const enteredCount = students.filter(
    (s) =>
      studentMarks[s.id]?.score !== "" &&
      studentMarks[s.id]?.score !== undefined
  ).length
  const invalidCount = students.filter((s) => isOutOfRange(studentMarks[s.id]?.score)).length
  const progressPercent =
    students.length > 0 ? Math.round((enteredCount / students.length) * 100) : 0
  const allEntered = students.length > 0 && enteredCount === students.length

  return (
    <div className="space-y-5">
      {(role === "TEACHER" || isPrincipal) && selectedClassId && !canEditMarks && (
        <Alert variant="info">
          <Eye />
          <AlertTitle>View only</AlertTitle>
          <AlertDescription>
            {isPrincipal
              ? "Principals have view-only access to marks."
              : "Only this class’s assigned teacher can enter or change marks."}
          </AlertDescription>
        </Alert>
      )}

      {/* Selection */}
      <FilterBar>
        <FilterField label="Academic Year" htmlFor="marks-year" className="sm:w-28">
          <select
            id="marks-year"
            value={filterYear}
            onChange={(e) => guardedChange(e, setFilterYear)}
            className="h-9 w-full px-3 text-sm"
          >
            {Array.from(new Set([filterYear, "2026", "2025", "2024"]))
              .sort((a, b) => Number(b) - Number(a))
              .map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </FilterField>

        <FilterField
          label={
            <span className="flex items-center gap-1.5">
              Class Cohort
              {isAssignedClass && <Badge className="px-1.5 py-0 text-[10px]">Your class</Badge>}
            </span>
          }
          htmlFor="marks-class"
          className="sm:w-52"
        >
          <select
            id="marks-class"
            value={selectedClassId}
            onChange={(e) => guardedChange(e, selectClass)}
            className="h-9 w-full px-3 text-sm"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} {role === "TEACHER" && String(cls.classTeacherId) === String(userProfile?.id) ? "★ (Your Assigned Class)" : ""}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Target Examination" htmlFor="marks-exam" className="sm:w-60">
          <select
            id="marks-exam"
            value={activeExamId}
            onChange={(e) => guardedChange(e, setSelectedExamId)}
            disabled={relevantExams.length === 0}
            className="h-9 w-full px-3 text-sm"
          >
            {relevantExams.length === 0 && <option value="">No term examinations scheduled</option>}
            {relevantExams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                Grade {selectedClass?.gradeLevel} {TERM_LABELS[ex.term]}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Curriculum Subject" htmlFor="marks-subject" className="sm:w-60">
          <select
            id="marks-subject"
            value={selectedSubjectId}
            onChange={(e) => guardedChange(e, setSelectedSubjectId)}
            disabled={subjects.length === 0}
            className="h-9 w-full px-3 text-sm"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </FilterField>
      </FilterBar>

      {/* Progress */}
      <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface px-4 py-3.5 shadow-card sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-2 text-[13px] text-foreground-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="tabular font-semibold text-foreground">{students.length}</span> students
        </div>
        <div className="flex flex-1 items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                allEntered ? "bg-success" : "bg-accent-blue"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="tabular shrink-0 text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">{enteredCount}</span> / {students.length} entered
          </span>
          {allEntered && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-label="All marks entered" />}
        </div>
        {invalidCount > 0 && (
          <Badge variant="destructive" dot>
            {invalidCount} out of range
          </Badge>
        )}
      </div>

      {/* Grid */}
      <div ref={gridRef} onKeyDown={canEditMarks ? handleGridKeyDown : undefined}>
        <Table containerClassName="max-h-[min(70vh,780px)]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-32">Admission No</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="w-32">Score / 100</TableHead>
              <TableHead className="w-40">Grade</TableHead>
              <TableHead className="min-w-[220px]">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }, (_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell><Skeleton className="h-4 w-5" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-full" /></TableCell>
                </TableRow>
              ))
            ) : !activeExamId ? (
              <TableEmptyRow
                colSpan={6}
                icon={CalendarX}
                title="No term exams for this class yet"
                description="Marks are recorded against a scheduled term exam. Pick another year or ask an administrator to schedule one."
              />
            ) : students.length === 0 ? (
              <TableEmptyRow colSpan={6} icon={Users} title="No students found in this class." />
            ) : (
              students.map((student, idx) => {
                const markEntry = studentMarks[student.id] || EMPTY_ENTRY
                const isInvalid = isOutOfRange(markEntry.score)
                const isChanged = canEditMarks && changedIds.has(student.id)

                return (
                  <TableRow key={student.id} data-student-id={student.id}>
                    <TableCell className="tabular text-xs text-muted-foreground">
                      <span className="relative">
                        {isChanged && (
                          <span
                            aria-label="Unsaved"
                            className="absolute -left-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent-blue"
                          />
                        )}
                        {idx + 1}
                      </span>
                    </TableCell>

                    <TableCell>
                      <code className="tabular rounded-[6px] bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-foreground-2">
                        {student.admissionNumber}
                      </code>
                    </TableCell>

                    <TableCell className="whitespace-nowrap font-medium text-foreground">{student.fullName}</TableCell>

                    <TableCell>
                      {canEditMarks ? (
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="—"
                          aria-label={`Score for ${student.fullName}`}
                          aria-invalid={isInvalid || undefined}
                          data-row={idx}
                          data-col="score"
                          value={markEntry.score ?? ""}
                          onChange={(e) => handleScoreChange(student.id, e.target.value)}
                          onBlur={(e) => isInvalid && shake(e.currentTarget)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className={cn(
                            "tabular h-9 w-24 rounded-[9px] border bg-surface px-2 text-center text-sm font-semibold text-foreground transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                            isInvalid
                              ? "border-danger bg-danger-soft text-danger focus-visible:ring-danger/20"
                              : "border-border-strong hover:border-accent-blue/40 focus-visible:border-ring focus-visible:ring-ring/20"
                          )}
                        />
                      ) : (
                        <span className="tabular text-sm font-medium text-foreground">
                          {markEntry.score === "" ? "—" : markEntry.score}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {isInvalid ? (
                        <span className="text-xs font-medium text-danger">0–100 only</span>
                      ) : (
                        <GradeBadge grade={markEntry.grade} />
                      )}
                    </TableCell>

                    <TableCell>
                      {canEditMarks ? (
                        <input
                          type="text"
                          placeholder="Optional remark"
                          aria-label={`Remarks for ${student.fullName}`}
                          data-row={idx}
                          data-col="remarks"
                          value={markEntry.remarks ?? ""}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="h-9 w-full rounded-[9px] border border-transparent bg-transparent px-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 transition-colors hover:border-border focus-visible:border-ring focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
                        />
                      ) : (
                        <span className="text-[13px] text-foreground-2">{markEntry.remarks || "—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sticky save bar */}
      {canEditMarks && activeExamId && students.length > 0 && (
        <div className="sticky bottom-4 z-10">
          <div
            className={cn(
              "flex flex-col gap-3 rounded-[14px] border bg-surface/95 px-4 py-3 shadow-pop backdrop-blur-md transition-colors sm:flex-row sm:items-center",
              hasChanges ? "border-accent-blue/40" : "border-border"
            )}
          >
            <div className="flex flex-1 items-center gap-2 text-[13px]">
              {hasChanges ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-accent-blue" />
                  <span className="font-medium text-foreground">
                    {changedIds.size} unsaved {changedIds.size === 1 ? "change" : "changes"}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-muted-foreground">All changes saved</span>
                </>
              )}
              <span className="ml-3 hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
                <Keyboard className="h-3.5 w-3.5" />
                Enter or ↑ ↓ moves between students
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Button variant="ghost" size="sm" onClick={discardChanges} disabled={saving} className="gap-1.5">
                  <Undo2 className="h-4 w-4" />
                  Discard
                </Button>
              )}
              <Button
                onClick={handleSaveAll}
                loading={saving}
                disabled={!hasChanges || loading || students.length === 0 || !activeExamId}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save All Marks
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
