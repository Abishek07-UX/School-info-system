import { useState, useEffect, useCallback } from "react"
import { academicService } from "@/services/academicService"
import { useAuthUser } from "@/context/AuthUserContext"
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
import { Skeleton } from "@/components/ui/skeleton"
import { StatTile } from "@/components/ui/stat-tile"
import { EmptyState } from "@/components/ui/empty-state"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { FilterBar, FilterField } from "@/components/ui/filter-bar"
import { GRADE_TEXT, calculateGrade } from "@/lib/grades"
import { cn } from "@/lib/utils"
import { GradeBadge } from "./GradeBadge"
import {
  Award,
  Printer,
  FileText,
  TrendingUp,
  Trophy,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Gauge,
  Sigma,
  CheckCircle2,
  XCircle,
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
      setSelectedClassId((current) => current || (assigned || classes[0]).id)
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

        setSelectedStudentId((current) =>
          studentsList?.some((student) => String(student.id) === String(current))
            ? current
            : studentsList?.[0]?.id || ""
        )
      } catch (err) {
        console.error("Failed to load class context:", err)
      } finally {
        setLoading(false)
      }
    }

    loadClassContext()
  }, [selectedClassId, academicYear, getToken])

  // When selected term changes, update selectedExamId
  useEffect(() => {
    const matchingExam = exams.find((e) => e.term === selectedTerm)
    if (matchingExam) {
      setSelectedExamId(matchingExam.id)
    } else if (exams.length > 0) {
      setSelectedExamId(exams[0].id)
      setSelectedTerm(exams[0].term)
    } else {
      setSelectedExamId("")
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

  const isYourClass = assignedClass && String(assignedClass.id) === String(selectedClassId)

  // Medal colours only for the podium; everyone else gets a plain rank
  const rankStyle = (rank) =>
    rank === 1
      ? "bg-medal-gold-soft text-medal-gold border-medal-gold-border"
      : rank === 2
        ? "bg-medal-silver-soft text-medal-silver border-medal-silver-border"
        : rank === 3
          ? "bg-medal-bronze-soft text-medal-bronze border-medal-bronze-border"
          : "bg-surface-2 text-foreground-2 border-border"
  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`
  }

  const loadingBlock = (
    <div className="space-y-3">
      <Skeleton className="h-24" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[74px]" />)}
      </div>
      <Skeleton className="h-56" />
    </div>
  )

  const emptyBlock = (icon, title, description) => (
    <div className="rounded-[12px] border border-border bg-surface shadow-card">
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          label="Report View Format"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: "TERM_REPORT", label: "Term Report", icon: FileText },
            { value: "ANNUAL_SUMMARY", label: "3-Term Annual", icon: TrendingUp },
            { value: "CLASS_LEADERBOARD", label: "Leaderboard", icon: Trophy },
          ]}
        />
        {viewMode === "TERM_REPORT" && reportCardData && (
          <Button onClick={() => setShowPrintModal(true)} size="sm" className="gap-2 self-start sm:self-auto">
            <Printer className="h-4 w-4" /> Printable Transcript
          </Button>
        )}
      </div>

      <FilterBar>
        <FilterField
          label={
            <span className="flex items-center gap-1.5">
              Class / Grade
              {isYourClass && <Badge className="px-1.5 py-0 text-[10px]">Your class</Badge>}
            </span>
          }
          htmlFor="report-class"
          className="sm:w-60"
        >
          <select
            id="report-class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="h-9 w-full px-3 text-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Grade {c.gradeLevel}) {assignedClass && c.id === assignedClass.id ? "★ (Your Assigned Class)" : ""}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Academic Year" htmlFor="report-year" className="sm:w-28">
          <select id="report-year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className="h-9 w-full px-3 text-sm">
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </FilterField>

        {viewMode !== "ANNUAL_SUMMARY" && (
          <FilterField label="Term" htmlFor="report-term" className="sm:w-32">
            <select id="report-term" value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="h-9 w-full px-3 text-sm">
              <option value="TERM_1">Term 1</option>
              <option value="TERM_2">Term 2</option>
              <option value="TERM_3">Term 3</option>
            </select>
          </FilterField>
        )}

        {viewMode !== "CLASS_LEADERBOARD" && (
          <FilterField label="Select Student" htmlFor="report-student" className="sm:w-72">
            <select
              id="report-student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={students.length === 0}
              className="h-9 w-full px-3 text-sm"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.admissionNumber})
                </option>
              ))}
            </select>
          </FilterField>
        )}
      </FilterBar>

      {feedback && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Couldn't load the report</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* MODE 1: single term report card */}
      {viewMode === "TERM_REPORT" && (
        loading ? loadingBlock : !reportCardData ? (
          emptyBlock(FileText, "No examination marks found for the selected student and term.", "Pick another term or student, or enter marks for this exam first.")
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-[12px] border border-border bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-title text-foreground">{reportCardData.studentName}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  <span className="tabular">{reportCardData.admissionNumber}</span> · {reportCardData.className}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reportCardData.examName} · {reportCardData.termDisplayName || reportCardData.term}
                </p>
              </div>
              <div className={cn("shrink-0 rounded-[12px] border px-5 py-3 text-center", rankStyle(reportCardData.classRank))}>
                <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Class rank</div>
                <div className="tabular text-2xl font-semibold">{ordinal(reportCardData.classRank)}</div>
                <div className="text-[11px] opacity-80">of {reportCardData.totalStudentsInClass} students</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatTile
                icon={Sigma}
                label={`Total of ${reportCardData.maxPossibleMarks}`}
                value={Number(reportCardData.totalMarks) || 0}
                tone="neutral"
              />
              <StatTile icon={Gauge} label="Average" value={Number(reportCardData.averageScore) || 0} suffix="%" decimals={1} tone="blue" />
              <StatTile
                icon={reportCardData.passedOverall ? CheckCircle2 : XCircle}
                label="Overall result"
                value={reportCardData.passedOverall ? "Passed" : "Failed"}
                tone={reportCardData.passedOverall ? "green" : "red"}
              />
              <StatTile icon={Award} label="Overall grade" value={`Grade ${reportCardData.overallGrade}`} tone="amber" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Subjects</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-28 text-center">Score / 100</TableHead>
                    <TableHead className="w-40">Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportCardData.subjectMarks.map((sub, idx) => (
                    <TableRow key={sub.subjectId}>
                      <TableCell className="tabular text-xs text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-foreground">
                        {sub.subjectName} <span className="text-xs font-normal text-muted-foreground">{sub.subjectCode}</span>
                      </TableCell>
                      <TableCell className={cn("tabular text-center font-semibold", sub.score >= 50 ? "text-foreground" : "text-danger")}>
                        {sub.score}
                      </TableCell>
                      <TableCell>
                        <GradeBadge grade={sub.grade} />
                      </TableCell>
                      <TableCell className="text-[13px] text-foreground-2">{sub.remarks || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <figure className="rounded-[12px] border border-border bg-surface p-4 shadow-card">
              <figcaption className="mb-1 text-xs font-medium text-muted-foreground">Principal's remarks</figcaption>
              <blockquote className="text-sm italic leading-relaxed text-foreground-2">“{reportCardData.principalRemarks}”</blockquote>
            </figure>
          </div>
        )
      )}

      {/* MODE 2: 3-term annual progression */}
      {viewMode === "ANNUAL_SUMMARY" && (
        loading ? loadingBlock : !annualData ? (
          emptyBlock(TrendingUp, "No annual evaluation records available for the selected student.", "The annual view fills in as term exams are marked.")
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-section text-foreground">
                {annualData.studentName} · {annualData.academicYear}
              </h3>
              <p className="text-xs text-muted-foreground">
                <span className="tabular">{annualData.admissionNumber}</span> · {annualData.className}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { key: "term1", label: "Term 1", pending: "Evaluation pending" },
                { key: "term2", label: "Term 2", pending: "Evaluation pending" },
                { key: "term3", label: "Term 3 · Final", pending: "Evaluation scheduled" },
              ].map(({ key, label, pending }) => {
                const term = annualData[key]
                const available = term && term.available
                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-[12px] border p-5 shadow-card",
                      available ? "border-border bg-surface" : "border-dashed border-border bg-surface/50"
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> {label}
                    </div>
                    {available ? (
                      <>
                        <div className="tabular mt-1 text-3xl font-semibold tracking-tight text-foreground">{term.averageScore}%</div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-foreground-2">
                            <Trophy className="h-3.5 w-3.5 text-warning" /> Rank {term.classRank} of {term.totalStudents}
                          </span>
                          <GradeBadge grade={term.overallGrade} showLabel={false} />
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">Total {term.totalMarks} marks</div>
                      </>
                    ) : (
                      <div className="py-6 text-sm text-muted-foreground">{pending}</div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile icon={Gauge} label="Annual average" value={Number(annualData.annualAverage) || 0} suffix="%" decimals={1} tone="blue" />
              <StatTile
                icon={Trophy}
                label={`Class standing of ${annualData.totalStudentsInClass}`}
                value={annualData.annualRank ? `Rank ${annualData.annualRank}` : "—"}
                tone="amber"
              />
              <StatTile
                icon={annualData.annualStatus === "PROMOTED" ? CheckCircle2 : XCircle}
                label="Promotion"
                value={annualData.annualStatus === "PROMOTED" ? "Promoted" : "Retained"}
                tone={annualData.annualStatus === "PROMOTED" ? "green" : "red"}
              />
            </div>
          </div>
        )
      )}

      {/* MODE 3: class leaderboard */}
      {viewMode === "CLASS_LEADERBOARD" && (
        loading ? loadingBlock : !leaderboardData ? (
          emptyBlock(Trophy, "No examination marks found for this class and term.", "Rankings appear once marks are entered for the term exam.")
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-section text-foreground">{leaderboardData.className}</h3>
                <p className="text-xs text-muted-foreground">
                  {leaderboardData.examName} · {leaderboardData.termDisplayName || leaderboardData.term} · {leaderboardData.academicYear}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" className="tabular">Class avg {leaderboardData.classAverage}%</Badge>
                <Badge variant="success" className="tabular">Pass rate {leaderboardData.passRate}%</Badge>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="w-28 text-center">Total</TableHead>
                  <TableHead className="w-28 text-center">Average</TableHead>
                  <TableHead className="w-20 text-center">Grade</TableHead>
                  <TableHead className="w-20 text-center">Result</TableHead>
                  <TableHead className="w-28 text-right">Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.rankings.map((item) => (
                  <TableRow key={item.studentId}>
                    <TableCell>
                      <span className={cn("tabular inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-xs font-semibold", rankStyle(item.rank))}>
                        {item.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-nowrap font-medium text-foreground">{item.studentName}</div>
                      <div className="tabular text-xs text-muted-foreground">{item.admissionNumber}</div>
                    </TableCell>
                    <TableCell className="tabular text-center text-foreground-2">{item.totalMarks}</TableCell>
                    <TableCell className={cn("tabular text-center font-semibold", GRADE_TEXT[calculateGrade(item.averageScore)])}>
                      {item.averageScore}%
                    </TableCell>
                    <TableCell className="text-center">
                      <GradeBadge grade={item.overallGrade} showLabel={false} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={item.passedOverall ? "success" : "destructive"}>{item.passedOverall ? "Pass" : "Fail"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          setSelectedStudentId(item.studentId)
                          setViewMode("TERM_REPORT")
                        }}
                        className="gap-1 text-accent-blue"
                      >
                        Report <ArrowRight className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}

      {showPrintModal && reportCardData && (
        <PrintableReportCard reportCard={reportCardData} onClose={() => setShowPrintModal(false)} />
      )}
    </div>
  )
}
