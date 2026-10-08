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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { StatTile } from "@/components/ui/stat-tile"
import { EmptyState } from "@/components/ui/empty-state"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { FilterBar, FilterField } from "@/components/ui/filter-bar"
import { GRADE_FILL, GRADE_TEXT, calculateGrade } from "@/lib/grades"
import { cn } from "@/lib/utils"
import { GradeBadge } from "./GradeBadge"
import { GradeDistribution } from "./GradeDistribution"
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Star,
  Target,
  AlertTriangle,
  Trophy,
  Gauge,
  CheckCircle2,
  Users,
} from "lucide-react"

export default function PerformanceAnalyticsTab({ classes = [] }) {
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

  const isYourClass = assignedClass && String(assignedClass.id) === String(selectedClassId)
  const trendInfo = {
    IMPROVING: { variant: "success", label: "Improving", icon: TrendingUp },
    DECLINING: { variant: "destructive", label: "Declining", icon: TrendingDown },
  }[studentTrend?.progressTrajectory] || { variant: "info", label: "Consistent", icon: ArrowRight }
  const TrendIcon = trendInfo.icon

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Subject pass rates and grade spread for a class, or one student's progress across the three terms.
        </p>
        <SegmentedControl
          label="Analytics Mode"
          value={analyticsMode}
          onChange={setAnalyticsMode}
          options={[
            { value: "CLASS_METRICS", label: "Class Subject Metrics", icon: BarChart3 },
            { value: "STUDENT_TRAJECTORY", label: "Student 3-Term Trajectory", icon: TrendingUp },
          ]}
        />
      </div>

      <FilterBar>
        <FilterField
          label={
            <span className="flex items-center gap-1.5">
              Class / Grade
              {isYourClass && <Badge className="px-1.5 py-0 text-[10px]">Your class</Badge>}
            </span>
          }
          htmlFor="analytics-class"
          className="sm:w-52"
        >
          <select
            id="analytics-class"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="h-9 w-full px-3 text-sm"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {assignedClass && c.id === assignedClass.id ? "★ (Your Assigned Class)" : ""}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Academic Year" htmlFor="analytics-year" className="sm:w-28">
          <select
            id="analytics-year"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="h-9 w-full px-3 text-sm"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </FilterField>

        {analyticsMode === "CLASS_METRICS" ? (
          <FilterField label="Target Examination" htmlFor="analytics-exam" className="sm:w-80">
            <select
              id="analytics-exam"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={exams.length === 0}
              className="h-9 w-full px-3 text-sm"
            >
              {exams.length === 0 && <option value="">No exams this year</option>}
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.termDisplayName || ex.term})
                </option>
              ))}
            </select>
          </FilterField>
        ) : (
          <FilterField label="Select Student" htmlFor="analytics-student" className="sm:w-72">
            <select
              id="analytics-student"
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
          <AlertTitle>Couldn't load analytics</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* MODE A: class-wide subject analytics */}
      {analyticsMode === "CLASS_METRICS" && (
        loading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[74px]" />)}
            </div>
            <Skeleton className="h-28" />
            <Skeleton className="h-64" />
          </div>
        ) : !classAnalytics ? (
          <div className="rounded-[12px] border border-border bg-surface shadow-card">
            <EmptyState
              icon={BarChart3}
              title="No evaluation data found for the selected examination."
              description="Once marks are entered for this exam, class averages and grade spreads appear here."
            />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-section text-foreground">{classAnalytics.className}</h3>
              <p className="text-xs text-muted-foreground">
                {classAnalytics.examName} · {classAnalytics.termDisplayName || classAnalytics.term} · {classAnalytics.academicYear}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatTile icon={Gauge} label="Class average" value={Number(classAnalytics.overallClassAverage) || 0} suffix="%" decimals={1} tone="blue" />
              <StatTile
                icon={CheckCircle2}
                label="Pass rate"
                value={Number(classAnalytics.overallPassRate) || 0}
                suffix="%"
                decimals={1}
                tone={Number(classAnalytics.overallPassRate) >= 80 ? "green" : "amber"}
              />
              <StatTile icon={ArrowUp} label="Highest average" value={Number(classAnalytics.highestAverage) || 0} suffix="%" decimals={1} tone="green" />
              <StatTile icon={ArrowDown} label="Lowest average" value={Number(classAnalytics.lowestAverage) || 0} suffix="%" decimals={1} tone="red" />
              <StatTile icon={Users} label="Students" value={Number(classAnalytics.totalStudents) || 0} tone="neutral" />
            </div>

            <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
              <h4 className="mb-4 text-sm font-semibold text-foreground">Overall grade distribution</h4>
              <GradeDistribution distribution={classAnalytics.overallGradeDistribution} total={classAnalytics.totalStudents} />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">By subject</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-48">Average</TableHead>
                    <TableHead className="w-24 text-center">Pass rate</TableHead>
                    <TableHead className="w-28 text-center">High / Low</TableHead>
                    {["A", "B", "C", "S", "F"].map((g) => (
                      <TableHead key={g} className={cn("w-12 text-center", GRADE_TEXT[g])}>{g}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classAnalytics.subjectPerformances.map((sp) => (
                    <TableRow key={sp.subjectId}>
                      <TableCell className="whitespace-nowrap font-medium text-foreground">
                        {sp.subjectName} <span className="text-xs font-normal text-muted-foreground">{sp.subjectCode}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className={cn("h-full rounded-full", GRADE_FILL[calculateGrade(sp.averageScore)] || "bg-accent-blue")}
                              style={{ width: `${Math.min(Number(sp.averageScore) || 0, 100)}%` }}
                            />
                          </div>
                          <span className="tabular w-12 text-right font-semibold text-foreground">{sp.averageScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={sp.passRate >= 80 ? "success" : "warning"} className="tabular">
                          {sp.passRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular text-center text-xs">
                        <span className="font-semibold text-success">{sp.highestScore}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="font-semibold text-danger">{sp.lowestScore}</span>
                      </TableCell>
                      {["A", "B", "C", "S", "F"].map((g) => (
                        <TableCell key={g} className={cn("tabular text-center font-semibold", (sp.gradeDistribution?.[g] || 0) ? GRADE_TEXT[g] : "text-muted-foreground/50")}>
                          {sp.gradeDistribution?.[g] || 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      )}

      {/* MODE B: individual student 3-term trajectory */}
      {analyticsMode === "STUDENT_TRAJECTORY" && (
        loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
          </div>
        ) : !studentTrend ? (
          <div className="rounded-[12px] border border-border bg-surface shadow-card">
            <EmptyState
              icon={TrendingUp}
              title="No historical evaluation records found for the selected student."
              description="Progress appears after the student has marks in at least one term exam."
            />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-[12px] border border-border bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-section text-foreground">{studentTrend.studentName}</h3>
                <p className="text-xs text-muted-foreground">
                  <span className="tabular">{studentTrend.admissionNumber}</span> · {studentTrend.currentClassName}
                </p>
              </div>
              <Badge variant={trendInfo.variant} className="gap-1.5 self-start px-2.5 py-1 text-xs sm:self-auto">
                <TrendIcon className="h-3.5 w-3.5" />
                {trendInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] border border-success/25 bg-success-soft p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-success">
                  <Star className="h-4 w-4" /> Strongest subject
                </div>
                <div className="mt-1 text-base font-semibold text-foreground">{studentTrend.strongestSubject}</div>
              </div>
              <div className="rounded-[12px] border border-warning/25 bg-warning-soft p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-warning">
                  <Target className="h-4 w-4" /> Needs focus
                </div>
                <div className="mt-1 text-base font-semibold text-foreground">{studentTrend.weakestSubject}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">Term by term</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {studentTrend.termTrends.map((tt, i) => {
                  const previous = studentTrend.termTrends[i - 1]
                  const delta = previous ? Number(tt.averageScore) - Number(previous.averageScore) : null
                  return (
                    <div key={tt.examId} className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
                      <div className="text-xs font-medium text-muted-foreground">
                        {tt.termDisplayName || tt.term} · {tt.academicYear}
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="tabular text-3xl font-semibold tracking-tight text-foreground">{tt.averageScore}%</span>
                        {delta !== null && Number.isFinite(delta) && delta !== 0 && (
                          <span className={cn("tabular flex items-center text-xs font-semibold", delta > 0 ? "text-success" : "text-danger")}>
                            {delta > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                            {Math.abs(delta).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-foreground-2">
                          <Trophy className="h-3.5 w-3.5 text-warning" />
                          Rank {tt.classRank} of {tt.totalStudentsInClass}
                        </span>
                        <GradeBadge grade={tt.overallGrade} showLabel={false} />
                      </div>
                      <div className="mt-1 text-[11px] text-muted-foreground">Total {tt.totalMarks} marks</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}
