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
  Award,
  Printer,
  FileText,
  TrendingUp,
  Trophy,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Calendar,
} from "lucide-react"
import PrintableReportCard from "./PrintableReportCard"

export default function ReportCardTab({ classes = [] }) {
  const { getToken, userProfile } = useAuthUser()
  const assignedClass = classes?.find((c) => c.classTeacherId === userProfile?.id)
  const [selectedClassId, setSelectedClassId] = useState(
    assignedClass?.id ? assignedClass.id : classes.length > 0 ? classes[0].id : ""
  )

  useEffect(() => {
    if (classes && classes.length > 0) {
      const assigned = classes.find((c) => c.classTeacherId === userProfile?.id)
      if (assigned && (!selectedClassId || selectedClassId === classes[0]?.id)) {
        setSelectedClassId(assigned.id)
      }
    }
  }, [classes, userProfile?.id])

  const [academicYear, setAcademicYear] = useState("2026")
  const [viewMode, setViewMode] = useState("TERM_REPORT") // 'TERM_REPORT', 'ANNUAL_SUMMARY', 'CLASS_LEADERBOARD'
  const [selectedTerm, setSelectedTerm] = useState("TERM_1")

  const [exams, setExams] = useState([])
  const [selectedExamId, setSelectedExamId] = useState("")
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState("")

  const [reportCardData, setReportCardData] = useState(null)
  const [annualData, setAnnualData] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState(null)

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [showPrintModal, setShowPrintModal] = useState(false)

  // Load exams and students when class & year change
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

        if (studentsList && studentsList.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentsList[0].id)
        }

        const matchingExam = examsList?.find((e) => e.term === selectedTerm)
        if (matchingExam) {
          setSelectedExamId(matchingExam.id)
        } else if (examsList && examsList.length > 0) {
          setSelectedExamId(examsList[0].id)
          setSelectedTerm(examsList[0].term)
        }
      } catch (err) {
        console.error("Failed to load class context:", err)
      } finally {
        setLoading(false)
      }
    }

    loadClassContext()
  }, [selectedClassId, academicYear, selectedTerm, getToken, selectedStudentId])

  // When selected term changes, update selectedExamId
  useEffect(() => {
    const matchingExam = exams.find((e) => e.term === selectedTerm)
    if (matchingExam) {
      setSelectedExamId(matchingExam.id)
    }
  }, [selectedTerm, exams])

  // Load content based on current viewMode
  const loadData = useCallback(async () => {
    if (!selectedClassId) return

    try {
      setLoading(true)
      setFeedback(null)

      if (viewMode === "TERM_REPORT") {
        if (selectedStudentId && selectedExamId) {
          const data = await academicService.getReportCard(
            selectedStudentId,
            selectedExamId,
            getToken
          )
          setReportCardData(data)
        }
      } else if (viewMode === "ANNUAL_SUMMARY") {
        if (selectedStudentId) {
          const data = await academicService.getAnnualProgress(
            selectedStudentId,
            parseInt(academicYear, 10),
            selectedClassId,
            getToken
          )
          setAnnualData(data)
        }
      } else if (viewMode === "CLASS_LEADERBOARD") {
        if (selectedExamId) {
          const data = await academicService.getClassLeaderboard(
            selectedClassId,
            selectedExamId,
            getToken
          )
          setLeaderboardData(data)
        }
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to load report card data.",
      })
    } finally {
      setLoading(false)
    }
  }, [
    viewMode,
    selectedStudentId,
    selectedExamId,
    selectedClassId,
    academicYear,
    getToken,
  ])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getRankBadge = (rank) => {
    if (rank === 1)
      return {
        variant: "warning",
        bg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        text: "🥇 1st Place",
      }
    if (rank === 2)
      return {
        variant: "secondary",
        bg: "bg-slate-700/60 text-slate-200 border-slate-500/40",
        text: "🥈 2nd Place",
      }
    if (rank === 3)
      return {
        variant: "default",
        bg: "bg-amber-700/20 text-amber-400 border-amber-600/40",
        text: "🥉 3rd Place",
      }
    return {
      variant: "outline",
      bg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
      text: `#${rank} in Class`,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Print Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Term Report Cards & Class Rankings
          </h2>
          <p className="text-xs text-slate-400">
            Generate individual student report cards, track 3-term progression, and view live class leaderboards.
          </p>
        </div>

        {viewMode === "TERM_REPORT" && reportCardData && (
          <Button
            onClick={() => setShowPrintModal(true)}
            size="sm"
            className="gap-2"
          >
            <Printer className="h-4 w-4" /> Printable Transcript
          </Button>
        )}
      </div>

      {/* Control Panel */}
      <Card className="p-4 border-white/10">
        <div className="flex flex-wrap items-center gap-4">
          {/* Class */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400">Class / Grade</label>
              {assignedClass && String(assignedClass.id) === String(selectedClassId) && (
                <Badge variant="default" className="text-[9px] py-0 px-1.5 ml-2">
                  Your Class
                </Badge>
              )}
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Grade {c.gradeLevel}) {assignedClass && c.id === assignedClass.id ? "★ (Your Assigned Class)" : ""}
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

          {/* Format Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Report View Format</label>
            <div className="flex items-center gap-1.5">
              <Button
                variant={viewMode === "TERM_REPORT" ? "default" : "outline"}
                size="xs"
                onClick={() => setViewMode("TERM_REPORT")}
                className="gap-1 text-xs"
              >
                <FileText className="h-3.5 w-3.5" /> Term Report
              </Button>
              <Button
                variant={viewMode === "ANNUAL_SUMMARY" ? "default" : "outline"}
                size="xs"
                onClick={() => setViewMode("ANNUAL_SUMMARY")}
                className="gap-1 text-xs"
              >
                <TrendingUp className="h-3.5 w-3.5" /> 3-Term Annual
              </Button>
              <Button
                variant={viewMode === "CLASS_LEADERBOARD" ? "default" : "outline"}
                size="xs"
                onClick={() => setViewMode("CLASS_LEADERBOARD")}
                className="gap-1 text-xs"
              >
                <Trophy className="h-3.5 w-3.5" /> Leaderboard
              </Button>
            </div>
          </div>

          {/* Term Selector */}
          {viewMode !== "ANNUAL_SUMMARY" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="TERM_1">📘 Term 1</option>
                <option value="TERM_2">📗 Term 2</option>
                <option value="TERM_3">📙 Term 3</option>
              </select>
            </div>
          )}

          {/* Student Selector */}
          {viewMode !== "CLASS_LEADERBOARD" && (
            <div className="space-y-1.5 flex-1 min-w-[220px]">
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
      {/* MODE 1: SINGLE TERM REPORT CARD                                           */}
      {/* ========================================================================= */}
      {viewMode === "TERM_REPORT" && (
        <div>
          {loading ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Compiling student evaluation report and ranking calculations...
            </Card>
          ) : !reportCardData ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              No examination marks found for the selected student and term.
            </Card>
          ) : (
            <Card className="p-6 border-white/10 space-y-6">
              {/* Student Bio & Rank Badge Row */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
                <div>
                  <div className="text-2xl font-bold font-heading text-white">
                    {reportCardData.studentName}
                  </div>
                  <div className="text-xs text-indigo-300 mt-1 flex items-center gap-2">
                    <span>Admission No: <code className="font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{reportCardData.admissionNumber}</code></span>
                    <span>&bull;</span>
                    <span>Class: <strong className="text-white">{reportCardData.className}</strong></span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Exam: <strong>{reportCardData.examName}</strong> ({reportCardData.termDisplayName || reportCardData.term})
                  </div>
                </div>

                {/* Class Rank Highlight Box */}
                {(() => {
                  const rBadge = getRankBadge(reportCardData.classRank)
                  return (
                    <div
                      className={`rounded-2xl border p-4 text-center ${rBadge.bg} backdrop-blur-md shadow-lg`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        CLASS RANKING
                      </div>
                      <div className="text-2xl font-extrabold font-heading mt-0.5">
                        {rBadge.text}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        out of {reportCardData.totalStudentsInClass} students
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Performance Cards Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Total Score</div>
                  <div className="text-2xl font-normal text-white mt-1">
                    {reportCardData.totalMarks}{" "}
                    <span className="text-xs text-slate-400 font-normal">
                      / {reportCardData.maxPossibleMarks}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Percentage Average</div>
                  <div className="text-2xl font-bold font-heading text-emerald-400 mt-1">
                    {reportCardData.averageScore}%
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Overall Result</div>
                  <div className="text-xl font-bold font-heading mt-1">
                    {reportCardData.passedOverall ? (
                      <Badge variant="success" className="text-xs">PASSED ✓</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">FAILED ✕</Badge>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="text-xs text-slate-400 font-semibold">Distinction Grade</div>
                  <div className="text-2xl font-bold font-heading text-amber-400 mt-1">
                    Grade {reportCardData.overallGrade}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="space-y-2">
                <h3 className="text-base font-bold font-heading text-white">
                  Subject Performance & Letter Grades
                </h3>
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Curriculum Subject</TableHead>
                        <TableHead className="text-center w-28">Max Marks</TableHead>
                        <TableHead className="text-center w-28">Score</TableHead>
                        <TableHead className="text-center w-32">Letter Grade</TableHead>
                        <TableHead>Teacher Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportCardData.subjectMarks.map((sub, idx) => (
                        <TableRow key={sub.subjectId} className="hover:bg-slate-800/30">
                          <TableCell className="text-xs text-slate-400 font-mono">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-semibold text-white">
                            {sub.subjectName}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              ({sub.subjectCode})
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-xs text-slate-400">
                            100
                          </TableCell>
                          <TableCell
                            className={`text-center font-bold ${
                              sub.score >= 50 ? "text-white" : "text-rose-400"
                            }`}
                          >
                            {sub.score}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                sub.grade === "A"
                                  ? "success"
                                  : sub.grade === "B"
                                  ? "info"
                                  : sub.grade === "C"
                                  ? "warning"
                                  : sub.grade === "S"
                                  ? "purple"
                                  : "destructive"
                              }
                              className="font-bold"
                            >
                              Grade {sub.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">
                            {sub.remarks || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Principal Remarks Card */}
              <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Principal Remarks:
                </div>
                <div className="text-sm italic text-slate-200 leading-relaxed">
                  "{reportCardData.principalRemarks}"
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 3-TERM ANNUAL PROGRESSION                                          */}
      {/* ========================================================================= */}
      {viewMode === "ANNUAL_SUMMARY" && (
        <div>
          {loading ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Loading 3-term annual progression trajectories...
            </Card>
          ) : !annualData ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              No annual evaluation records available for the selected student.
            </Card>
          ) : (
            <Card className="p-6 border-white/10 space-y-6">
              <div>
                <div className="text-xl font-bold font-heading text-white">
                  Annual 3-Term Academic Progression ({annualData.academicYear})
                </div>
                <div className="text-xs text-indigo-300 mt-1">
                  Student: <strong>{annualData.studentName}</strong> ({annualData.admissionNumber}) &bull; Class: <strong>{annualData.className}</strong>
                </div>
              </div>

              {/* Term Comparison Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Term 1 */}
                <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 backdrop-blur-md">
                  <div className="text-xs font-bold text-sky-400 mb-2 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Term 1 Examination
                  </div>
                  {annualData.term1 && annualData.term1.available ? (
                    <div className="space-y-2">
                      <div className="text-3xl font-extrabold font-heading text-white">
                        {annualData.term1.averageScore}%
                      </div>
                      <div className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" /> Rank: {annualData.term1.classRank} of {annualData.term1.totalStudents}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Total Marks: {annualData.term1.totalMarks} &bull; Grade: {annualData.term1.overallGrade}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic py-4">Evaluation Pending</div>
                  )}
                </div>

                {/* Term 2 */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-md">
                  <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Term 2 Examination
                  </div>
                  {annualData.term2 && annualData.term2.available ? (
                    <div className="space-y-2">
                      <div className="text-3xl font-extrabold font-heading text-white">
                        {annualData.term2.averageScore}%
                      </div>
                      <div className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" /> Rank: {annualData.term2.classRank} of {annualData.term2.totalStudents}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Total Marks: {annualData.term2.totalMarks} &bull; Grade: {annualData.term2.overallGrade}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic py-4">Evaluation Pending</div>
                  )}
                </div>

                {/* Term 3 */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 backdrop-blur-md">
                  <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Term 3 / Final Examination
                  </div>
                  {annualData.term3 && annualData.term3.available ? (
                    <div className="space-y-2">
                      <div className="text-3xl font-extrabold font-heading text-white">
                        {annualData.term3.averageScore}%
                      </div>
                      <div className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" /> Rank: {annualData.term3.classRank} of {annualData.term3.totalStudents}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Total Marks: {annualData.term3.totalMarks} &bull; Grade: {annualData.term3.overallGrade}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic py-4">Evaluation Scheduled</div>
                  )}
                </div>
              </div>

              {/* Annual Cumulative Standing */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-2xl border border-white/10 bg-slate-950/60 p-6 text-center">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">
                    Annual Cumulative Average
                  </div>
                  <div className="text-3xl font-bold font-heading text-emerald-400 mt-1">
                    {annualData.annualAverage}%
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">
                    Annual Class Standing
                  </div>
                  <div className="text-3xl font-bold font-heading text-amber-400 mt-1">
                    Rank {annualData.annualRank}{" "}
                    <span className="text-sm font-normal text-slate-400">
                      / {annualData.totalStudentsInClass}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">
                    Promotion Status
                  </div>
                  <div className="text-2xl font-bold font-heading mt-1">
                    {annualData.annualStatus === "PROMOTED" ? (
                      <Badge variant="success" className="text-sm px-3 py-1">PROMOTED ✓</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-sm px-3 py-1">RETAINED ✕</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: CLASS LEADERBOARD                                                 */}
      {/* ========================================================================= */}
      {viewMode === "CLASS_LEADERBOARD" && (
        <div>
          {loading ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Loading class rankings and leaderboard metrics...
            </Card>
          ) : !leaderboardData ? (
            <Card className="p-12 text-center text-slate-400 border-white/10">
              No examination marks found for this class and term.
            </Card>
          ) : (
            <Card className="p-6 border-white/10 space-y-6">
              {/* Leaderboard Summary Banner */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    Class Leaderboard & Standings — {leaderboardData.className}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {leaderboardData.examName} &bull; {leaderboardData.termDisplayName || leaderboardData.term} ({leaderboardData.academicYear})
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs">
                    Class Avg: <strong className="text-indigo-300">{leaderboardData.classAverage}%</strong>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs">
                    Pass Rate: <strong className="text-emerald-300">{leaderboardData.passRate}%</strong>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Rank</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="w-36">Admission No</TableHead>
                      <TableHead className="text-center w-28">Total Marks</TableHead>
                      <TableHead className="text-center w-28">Term Average</TableHead>
                      <TableHead className="text-center w-24">Grade</TableHead>
                      <TableHead className="text-center w-24">Status</TableHead>
                      <TableHead className="text-right w-32">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.rankings.map((item) => {
                      const rBadge = getRankBadge(item.rank)
                      return (
                        <TableRow key={item.studentId} className="hover:bg-slate-800/30">
                          {/* Rank Badge */}
                          <TableCell>
                            <Badge variant={rBadge.variant} className="font-extrabold">
                              {rBadge.text}
                            </Badge>
                          </TableCell>

                          {/* Name */}
                          <TableCell className="font-semibold text-white">
                            {item.studentName}
                          </TableCell>

                          {/* Admission */}
                          <TableCell>
                            <code className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {item.admissionNumber}
                            </code>
                          </TableCell>

                          {/* Total */}
                          <TableCell className="text-center font-semibold text-white">
                            {item.totalMarks}
                          </TableCell>

                          {/* Average */}
                          <TableCell
                            className={`text-center font-bold ${
                              item.averageScore >= 75
                                ? "text-emerald-400"
                                : item.averageScore >= 50
                                ? "text-sky-400"
                                : "text-rose-400"
                            }`}
                          >
                            {item.averageScore}%
                          </TableCell>

                          {/* Grade */}
                          <TableCell className="text-center font-bold">
                            {item.overallGrade}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-center">
                            <Badge
                              variant={item.passedOverall ? "success" : "destructive"}
                              className="text-[10px]"
                            >
                              {item.passedOverall ? "PASS" : "FAIL"}
                            </Badge>
                          </TableCell>

                          {/* Action */}
                          <TableCell className="text-right">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => {
                                setSelectedStudentId(item.studentId)
                                setViewMode("TERM_REPORT")
                              }}
                              className="text-xs text-indigo-300 hover:text-white gap-1"
                            >
                              Report <ArrowRight className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Printable Modal */}
      {showPrintModal && reportCardData && (
        <PrintableReportCard
          reportCard={reportCardData}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  )
}
