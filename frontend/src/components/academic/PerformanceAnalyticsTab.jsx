import { useState, useEffect, useCallback } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  BarChart3,
  Star,
  AlertTriangle,
  RefreshCw,
  Trophy,
} from "lucide-react"

export default function PerformanceAnalyticsTab({ classes }) {
  const { getToken } = useAuthUser()
  const [selectedClassId, setSelectedClassId] = useState(
    classes.length > 0 ? classes[0].id : ""
  )
  const [analyticsMode, setAnalyticsMode] = useState("CLASS_METRICS") // 'CLASS_METRICS' or 'STUDENT_TRAJECTORY'
  const [academicYear, setAcademicYear] = useState("2026")

  const [exams, setExams] = useState([])
  const [selectedExamId, setSelectedExamId] = useState("")
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState("")

  const [classAnalytics, setClassAnalytics] = useState(null)
  const [studentTrend, setStudentTrend] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Load exams and students when class changes
  useEffect(() => {
    if (!selectedClassId) return

    async function loadClassContext() {
      try {
        setLoading(true)
        const [examsList, studentsList] = await Promise.all([
          academicService.getExamsForClass(
            selectedClassId,
            parseInt(academicYear, 10),
            getToken
          ),
          academicService.getStudentsForClass(selectedClassId, getToken),
        ])

        setExams(examsList || [])
        setStudents(studentsList || [])

        if (examsList && examsList.length > 0) {
          setSelectedExamId(examsList[0].id)
        }
        if (studentsList && studentsList.length > 0) {
          setSelectedStudentId(studentsList[0].id)
        }
      } catch (err) {
        console.error("Failed to load class context:", err)
      } finally {
        setLoading(false)
      }
    }

    loadClassContext()
  }, [selectedClassId, academicYear, getToken])

  // Load analytics data based on mode
  const fetchAnalytics = useCallback(async () => {
    if (!selectedClassId) return

    try {
      setLoading(true)
      setFeedback(null)

      if (analyticsMode === "CLASS_METRICS" && selectedExamId) {
        const data = await academicService.getClassPerformanceAnalytics(
          selectedClassId,
          selectedExamId,
          getToken
        )
        setClassAnalytics(data)
      } else if (analyticsMode === "STUDENT_TRAJECTORY" && selectedStudentId) {
        const data = await academicService.getStudentProgressTrend(
          selectedStudentId,
          getToken
        )
        setStudentTrend(data)
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to load performance analytics.",
      })
    } finally {
      setLoading(false)
    }
  }, [
    analyticsMode,
    selectedClassId,
    selectedExamId,
    selectedStudentId,
    getToken,
  ])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Academic Performance & Trend Analytics
        </h2>
        <p className="text-xs text-slate-400">
          Analyze class-level subject performance, pass rates, score spreads, and individual 3-term student progression.
        </p>
      </div>

      {/* Control Panel */}
      <Card className="p-4 border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          {/* Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Analytics Mode</label>
            <div className="flex items-center gap-1.5">
              <Button
                variant={analyticsMode === "CLASS_METRICS" ? "default" : "outline"}
                size="xs"
                onClick={() => setAnalyticsMode("CLASS_METRICS")}
                className="gap-1.5 text-xs"
              >
                <BarChart3 className="h-3.5 w-3.5" /> Class Subject Metrics
              </Button>
              <Button
                variant={analyticsMode === "STUDENT_TRAJECTORY" ? "default" : "outline"}
                size="xs"
                onClick={() => setAnalyticsMode("STUDENT_TRAJECTORY")}
                className="gap-1.5 text-xs"
              >
                <TrendingUp className="h-3.5 w-3.5" /> Student 3-Term Trajectory
              </Button>
            </div>
          </div>

          {/* Class */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Class / Grade</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Academic Year</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Exam Selector */}
          {analyticsMode === "CLASS_METRICS" && (
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-slate-400">
                Target Examination
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.termDisplayName || ex.term})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Selector */}
          {analyticsMode === "STUDENT_TRAJECTORY" && (
            <div className="space-y-1.5 flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-slate-400">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.admissionNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Feedback Toast */}
      {feedback && (
        <Alert variant="destructive" className="animate-in fade-in-0 zoom-in-95">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* ========================================================================= */}
      {/* MODE A: CLASS-WIDE SUBJECT ANALYTICS                                      */}
      {/* ========================================================================= */}
      {analyticsMode === "CLASS_METRICS" && (
        <div>
          {loading ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Analyzing class cohort metrics and subject pass rates...
            </Card>
          ) : !classAnalytics ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              No evaluation data found for the selected examination.
            </Card>
          ) : (
            <Card className="p-6 border-white/10 space-y-6">
              <div>
                <div className="text-xl font-bold font-heading text-white">
                  Class Academic Performance — {classAnalytics.className}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {classAnalytics.examName} &bull; {classAnalytics.termDisplayName || classAnalytics.term} ({classAnalytics.academicYear})
                </div>
              </div>

              {/* Class Summary Metric Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Class Average Score</div>
                  <div className="text-2xl font-normal text-white mt-1">
                    {classAnalytics.overallClassAverage}%
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Overall Pass Rate</div>
                  <div className="text-2xl font-normal text-white mt-1">
                    {classAnalytics.overallPassRate}%
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Highest Average</div>
                  <div className="text-2xl font-normal text-white mt-1">
                    {classAnalytics.highestAverage}%
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Lowest Average</div>
                  <div className="text-2xl font-normal text-white mt-1">
                    {classAnalytics.lowestAverage}%
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Cohort Size</div>
                  <div className="text-2xl font-normal text-white mt-1">
                    {classAnalytics.totalStudents} Students
                  </div>
                </div>
              </div>

              {/* Overall Grade Distribution Bar */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <h4 className="text-sm font-bold font-heading text-white mb-4">
                  Overall Class Grade Distribution
                </h4>

                <div className="grid grid-cols-5 gap-3 text-center">
                  {["A", "B", "C", "S", "F"].map((g) => {
                    const count = classAnalytics.overallGradeDistribution?.[g] || 0
                    const pct =
                      classAnalytics.totalStudents > 0
                        ? ((count / classAnalytics.totalStudents) * 100).toFixed(1)
                        : 0
                    return (
                      <div
                        key={g}
                        className={`rounded-xl border p-3.5 backdrop-blur-md ${
                          g === "A"
                            ? "bg-emerald-500/10 border-emerald-500/30"
                            : g === "B"
                            ? "bg-sky-500/10 border-sky-500/30"
                            : g === "C"
                            ? "bg-amber-500/10 border-amber-500/30"
                            : g === "S"
                            ? "bg-purple-500/10 border-purple-500/30"
                            : "bg-rose-500/10 border-rose-500/30"
                        }`}
                      >
                        <div
                          className={`text-sm font-bold ${
                            g === "A"
                              ? "text-emerald-400"
                              : g === "B"
                              ? "text-sky-400"
                              : g === "C"
                              ? "text-amber-400"
                              : g === "S"
                              ? "text-purple-400"
                              : "text-rose-400"
                          }`}
                        >
                          Grade {g}
                        </div>
                        <div className="text-2xl font-extrabold font-heading text-white my-1">
                          {count}
                        </div>
                        <div className="text-[11px] text-slate-400">{pct}% cohort</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Curriculum Subject Metrics Table */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold font-heading text-white">
                  Curriculum Subject Performance Metrics
                </h4>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Curriculum Subject</TableHead>
                        <TableHead className="text-center w-28">Subject Avg</TableHead>
                        <TableHead className="text-center w-28">Pass Rate</TableHead>
                        <TableHead className="text-center w-36">High / Low</TableHead>
                        <TableHead className="text-center w-14">A</TableHead>
                        <TableHead className="text-center w-14">B</TableHead>
                        <TableHead className="text-center w-14">C</TableHead>
                        <TableHead className="text-center w-14">S</TableHead>
                        <TableHead className="text-center w-14">F</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classAnalytics.subjectPerformances.map((sp) => (
                        <TableRow key={sp.subjectId} className="hover:bg-slate-800/30">
                          <TableCell className="font-semibold text-white">
                            {sp.subjectName}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              ({sp.subjectCode})
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-indigo-300">
                            {sp.averageScore}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={sp.passRate >= 80 ? "success" : "warning"}
                              className="text-xs font-bold"
                            >
                              {sp.passRate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-xs text-slate-300">
                            <span className="text-emerald-400 font-bold">{sp.highestScore}</span> /{" "}
                            <span className="text-rose-400 font-bold">{sp.lowestScore}</span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-emerald-400">
                            {sp.gradeDistribution?.A || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-sky-400">
                            {sp.gradeDistribution?.B || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-amber-400">
                            {sp.gradeDistribution?.C || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-purple-400">
                            {sp.gradeDistribution?.S || 0}
                          </TableCell>
                          <TableCell className="text-center font-bold text-rose-400">
                            {sp.gradeDistribution?.F || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE B: INDIVIDUAL STUDENT 3-TERM TRAJECTORY                              */}
      {/* ========================================================================= */}
      {analyticsMode === "STUDENT_TRAJECTORY" && (
        <div>
          {loading ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Loading student progression trends...
            </Card>
          ) : !studentTrend ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              No historical evaluation records found for the selected student.
            </Card>
          ) : (
            <Card className="p-6 border-white/10 space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-xl font-bold font-heading text-white">
                    Student Progress Trajectory: {studentTrend.studentName}
                  </div>
                  <div className="text-xs text-indigo-300 mt-1">
                    Admission No: <code>{studentTrend.admissionNumber}</code> &bull; Class: <strong>{studentTrend.currentClassName}</strong>
                  </div>
                </div>

                <Badge
                  variant={
                    studentTrend.progressTrajectory === "IMPROVING"
                      ? "success"
                      : studentTrend.progressTrajectory === "DECLINING"
                      ? "destructive"
                      : "info"
                  }
                  className="text-xs font-bold px-3 py-1 self-start sm:self-auto"
                >
                  {studentTrend.progressTrajectory === "IMPROVING"
                    ? "📈 Improving Trend"
                    : studentTrend.progressTrajectory === "DECLINING"
                    ? "📉 Declining Trend"
                    : "➡️ Consistent Performance"}
                </Badge>
              </div>

              {/* Strengths & Focus Areas */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                    <Star className="h-4 w-4" /> Strongest Subject
                  </div>
                  <div className="text-lg font-bold text-white font-heading">
                    {studentTrend.strongestSubject}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-4 w-4" /> Focus Recommended Subject
                  </div>
                  <div className="text-lg font-bold text-white font-heading">
                    {studentTrend.weakestSubject}
                  </div>
                </div>
              </div>

              {/* Term-by-Term Score & Rank History */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold font-heading text-white">
                  Term-by-Term Score & Rank Trajectory
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {studentTrend.termTrends.map((tt) => (
                    <div
                      key={tt.examId}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-md"
                    >
                      <div className="text-xs font-bold text-indigo-300 mb-2">
                        {tt.termDisplayName || tt.term} ({tt.academicYear})
                      </div>
                      <div className="text-3xl font-extrabold font-heading text-white">
                        {tt.averageScore}%
                      </div>
                      <div className="text-xs font-semibold text-amber-400 mt-2 flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" /> Rank {tt.classRank} of {tt.totalStudentsInClass}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Total: {tt.totalMarks} &bull; Grade: {tt.overallGrade}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
