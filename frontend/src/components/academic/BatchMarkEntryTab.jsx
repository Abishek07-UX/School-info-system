import { useState, useEffect, useCallback, useMemo } from "react"
import { academicService } from "@/services/academicService"
import { useAuthUser } from "@/context/AuthUserContext"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Edit3,
  Save,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  School,
  Sparkles,
} from "lucide-react"

export default function BatchMarkEntryTab({ classes = [], preselectedExam }) {
  const { getToken, userProfile } = useAuthUser()

  // Find if teacher has an assigned class
  const assignedClass = useMemo(() => {
    if (!classes || classes.length === 0 || !userProfile?.id) return null
    return classes.find((c) => c.classTeacherId === userProfile.id) || null
  }, [classes, userProfile?.id])

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
  const [selectedExam, setSelectedExam] = useState(preselectedExam || null)
  const [subjects, setSubjects] = useState([])
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [students, setStudents] = useState([])
  const [studentMarks, setStudentMarks] = useState({}) // studentId -> { score, remarks, grade }
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [filterYear, setFilterYear] = useState("2026")

  // Auto-default class once classes or assignedClass becomes available
  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      const assigned = classes.find((c) => c.classTeacherId === userProfile?.id)
      setSelectedClassId(assigned ? String(assigned.id) : String(classes[0].id))
    }
  }, [classes, userProfile?.id, selectedClassId])

  const calculateGrade = (scoreNum) => {
    if (scoreNum === "" || isNaN(scoreNum) || scoreNum === null) return null
    const s = parseFloat(scoreNum)
    if (s >= 75.0) return "A"
    if (s >= 65.0) return "B"
    if (s >= 50.0) return "C"
    if (s >= 35.0) return "S"
    return "F"
  }

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

  // Filter exams relevant for the selected class (or school-wide exams)
  const relevantExams = useMemo(() => {
    if (!selectedClassId) return exams
    return exams.filter(
      (e) => !e.classId || String(e.classId) === String(selectedClassId)
    )
  }, [exams, selectedClassId])

  // Sync selected exam when relevant exams or selectedClassId change
  useEffect(() => {
    if (relevantExams.length > 0) {
      const exists = relevantExams.some((e) => String(e.id) === String(selectedExamId))
      if (!exists) {
        setSelectedExamId(String(relevantExams[0].id))
        setSelectedExam(relevantExams[0])
      }
    } else {
      setSelectedExamId("")
      setSelectedExam(null)
    }
  }, [relevantExams, selectedExamId])

  // When selected exam ID changes, update selectedExam object
  useEffect(() => {
    if (!selectedExamId) return
    const examObj = exams.find((e) => String(e.id) === String(selectedExamId))
    if (examObj) {
      setSelectedExam(examObj)
    }
  }, [selectedExamId, exams])

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
        setFeedback({
          type: "error",
          message: err.message || "Failed to load class curriculum and students.",
        })
      } finally {
        setLoading(false)
      }
    }
    loadClassData()
  }, [selectedClassId, getToken])

  // Load existing marks for (selectedExamId, selectedSubjectId)
  const loadExistingMarks = useCallback(async () => {
    if (!selectedExamId || !selectedSubjectId) return
    try {
      setLoading(true)
      const marksData = await academicService.getMarksForExamAndSubject(
        selectedExamId,
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
    } catch (err) {
      console.error("Failed to load marks:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedExamId, selectedSubjectId, getToken])

  useEffect(() => {
    loadExistingMarks()
  }, [loadExistingMarks])

  const getGradeBadge = (grade) => {
    switch (grade) {
      case "A":
        return <Badge variant="success" className="font-bold">A (Distinction)</Badge>
      case "B":
        return <Badge variant="info" className="font-bold">B (Very Good)</Badge>
      case "C":
        return <Badge variant="warning" className="font-bold">C (Good)</Badge>
      case "S":
        return <Badge variant="purple" className="font-bold">S (Pass)</Badge>
      case "F":
        return <Badge variant="destructive" className="font-bold">F (Fail)</Badge>
      default:
        return <span className="text-slate-500 font-mono">—</span>
    }
  }

  const handleScoreChange = (studentId, rawValue) => {
    const grade = calculateGrade(rawValue)
    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: rawValue,
        grade,
      },
    }))
  }

  const handleRemarksChange = (studentId, rawValue) => {
    setStudentMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: rawValue,
      },
    }))
  }

  const handleSaveAll = async () => {
    if (!selectedExamId || !selectedSubjectId) {
      setFeedback({
        type: "error",
        message: "Please choose an examination and curriculum subject.",
      })
      return
    }

    const items = []
    for (const student of students) {
      const entry = studentMarks[student.id]
      if (entry && entry.score !== "" && !isNaN(entry.score)) {
        const scoreVal = parseFloat(entry.score)
        if (scoreVal < 0 || scoreVal > 100) {
          setFeedback({
            type: "error",
            message: `Invalid score for ${student.fullName}. Marks must be between 0 and 100.`,
          })
          return
        }
        items.push({
          studentId: student.id,
          score: scoreVal,
          remarks: entry.remarks || "",
        })
      }
    }

    if (items.length === 0) {
      setFeedback({ type: "error", message: "No valid student marks entered to save." })
      return
    }

    try {
      setSaving(true)
      setFeedback(null)
      const res = await academicService.enterBatchMarks(
        {
          examId: parseInt(selectedExamId, 10),
          subjectId: parseInt(selectedSubjectId, 10),
          marks: items,
        },
        getToken
      )

      setFeedback({
        type: "success",
        message: `Successfully recorded evaluation marks for ${res.savedCount || items.length} students!`,
      })
      loadExistingMarks()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to save batch marks.",
      })
    } finally {
      setSaving(false)
    }
  }

  const enteredCount = students.filter(
    (s) =>
      studentMarks[s.id]?.score !== "" &&
      studentMarks[s.id]?.score !== undefined
  ).length
  const progressPercent =
    students.length > 0 ? Math.round((enteredCount / students.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header & Batch Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-purple-400" />
            Batch Subject Mark Entry
          </h2>
          <p className="text-xs text-slate-400">
            Enter numerical scores (0–100) per subject. Scores auto-convert into standard letter grades (A / B / C / S / F).
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={saving || loading || students.length === 0}
          size="sm"
          className="gap-2 shadow-lg shadow-indigo-500/25"
        >
          <Save className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} />
          {saving ? "Saving Marks..." : "Save All Marks"}
        </Button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <Alert
          variant={feedback.type === "error" ? "destructive" : "success"}
          className="animate-in fade-in-0 zoom-in-95"
        >
          {feedback.type === "error" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertTitle>{feedback.type === "error" ? "Error" : "Success"}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{feedback.message}</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setFeedback(null)}
              className="h-6 px-2 text-xs"
            >
              ✕
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Selection Control Panel */}
      <Card className="p-4 border-white/10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">
              Academic Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Class Cohort Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">
                Class Cohort *
              </label>
              {assignedClass && String(assignedClass.id) === String(selectedClassId) && (
                <Badge variant="default" className="text-[9px] py-0 px-1.5">
                  Your Class
                </Badge>
              )}
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {assignedClass && cls.id === assignedClass.id ? "★ (Your Assigned Class)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">
              Target Examination *
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {relevantExams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.termDisplayName || ex.term})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">
              Curriculum Subject *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Roster Progress Summary Bar */}
      <Card className="p-4 border-white/10 bg-slate-950/40">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="h-4 w-4 text-indigo-400" />
            <span>Enrolled Students in Class:</span>
            <span className="font-bold text-white">{students.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Marks Completion:</span>
            <Badge
              variant={
                enteredCount === students.length && students.length > 0
                  ? "success"
                  : "warning"
              }
              className="font-bold"
            >
              {enteredCount} / {students.length} ({progressPercent}%)
            </Badge>
          </div>
        </div>
        <Progress value={progressPercent} />
      </Card>

      {/* Spreadsheet Mark Entry Grid */}
      <Card className="border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-36">Admission No</TableHead>
              <TableHead>Student Full Name</TableHead>
              <TableHead className="w-36">Score (0–100)</TableHead>
              <TableHead className="w-36 text-center">Letter Grade</TableHead>
              <TableHead>Teacher Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  Loading class roster and existing marks...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  No students found in this class.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, idx) => {
                const markEntry = studentMarks[student.id] || {
                  score: "",
                  remarks: "",
                  grade: null,
                }
                const isInvalid =
                  markEntry.score !== "" &&
                  (parseFloat(markEntry.score) < 0 || parseFloat(markEntry.score) > 100)

                return (
                  <TableRow key={student.id} className="hover:bg-slate-800/30">
                    {/* Index */}
                    <TableCell className="text-xs text-slate-400 font-mono">
                      {idx + 1}
                    </TableCell>

                    {/* Admission */}
                    <TableCell>
                      <code className="text-xs font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {student.admissionNumber}
                      </code>
                    </TableCell>

                    {/* Full Name */}
                    <TableCell className="font-semibold text-white">
                      {student.fullName}
                    </TableCell>

                    {/* Numeric Score Input */}
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0–100"
                        value={markEntry.score}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        className={`h-9 w-28 text-center font-bold text-sm ${
                          isInvalid
                            ? "border-rose-500 focus-visible:ring-rose-500 bg-rose-950/20 text-rose-300"
                            : "bg-slate-950/80 text-white"
                        }`}
                      />
                    </TableCell>

                    {/* Live Grade Preview */}
                    <TableCell className="text-center">
                      {getGradeBadge(markEntry.grade)}
                    </TableCell>

                    {/* Remarks Input */}
                    <TableCell>
                      <Input
                        type="text"
                        placeholder="e.g. Good comprehension, consistent effort"
                        value={markEntry.remarks}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        className="h-9 text-xs bg-slate-950/60"
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
