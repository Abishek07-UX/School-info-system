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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Edit,
  Trash2,
  Edit3,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import ExamModal from "./ExamModal"
import ExamTimetableModal from "./ExamTimetableModal"

export default function ExamManagementTab({ classes, onSelectExamForMarkEntry }) {
  const { getToken, isAdmin, isPrincipal } = useAuthUser()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState("2026")
  const [filterTerm, setFilterTerm] = useState("ALL")
  const [filterClass, setFilterClass] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true)
      const data = await academicService.getExams(
        {
          academicYear: filterYear !== "ALL" ? parseInt(filterYear, 10) : undefined,
          term: filterTerm !== "ALL" ? filterTerm : undefined,
          classId: filterClass !== "ALL" ? parseInt(filterClass, 10) : undefined,
          status: filterStatus !== "ALL" ? filterStatus : undefined,
        },
        getToken
      )
      setExams(data || [])
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to load examinations.",
      })
    } finally {
      setLoading(false)
    }
  }, [filterYear, filterTerm, filterClass, filterStatus, getToken])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const handleSaveExam = async (formData) => {
    if (editingExam) {
      await academicService.updateExam(editingExam.id, formData, getToken)
      setFeedback({
        type: "success",
        message: "Examination schedule updated successfully!",
      })
    } else {
      await academicService.createExam(formData, getToken)
      setFeedback({
        type: "success",
        message: "New examination scheduled successfully!",
      })
    }
    fetchExams()
  }

  const handleDeleteExam = async (examId, examName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete examination "${examName}"? All recorded marks for this exam will also be removed.`
      )
    ) {
      return
    }
    try {
      await academicService.deleteExam(examId, getToken)
      setFeedback({
        type: "success",
        message: `Examination "${examName}" deleted.`,
      })
      setExams((prev) => prev.filter((e) => e.id !== examId))
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to delete examination.",
      })
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">✓ Completed</Badge>
      case "ONGOING":
        return <Badge variant="info">⏳ Ongoing</Badge>
      case "UPCOMING":
        return <Badge variant="warning">📅 Upcoming</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">✕ Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredExams = exams.filter((e) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      (e.name || "").toLowerCase().includes(term) ||
      (e.className || "").toLowerCase().includes(term) ||
      (e.termDisplayName || "").toLowerCase().includes(term)
    )
  })

  const completedCount = exams.filter((e) => e.status === "COMPLETED").length
  const upcomingCount = exams.filter((e) => e.status === "UPCOMING").length
  const ongoingCount = exams.filter((e) => e.status === "ONGOING").length

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            Examination Schedules & Terms
          </h2>
          <p className="text-xs text-slate-400">
            Manage 3-term examinations across Grades 1 to 13 (Sections A, B, C) for academic evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchExams}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </Button>

          {(isAdmin || isPrincipal) && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsTimetableModalOpen(true)}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25"
              >
                <Calendar className="h-4 w-4" /> Create Exam Timetable
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingExam(null)
                  setIsModalOpen(true)
                }}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Single Exam
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-white/10 p-4">
          <div className="text-xs text-slate-400 font-semibold">Total Scheduled</div>
          <div className="text-2xl font-normal text-white mt-1">
            {exams.length}
          </div>
        </Card>

        <Card className="border-white/10 p-4">
          <div className="text-xs text-slate-400 font-semibold">Completed</div>
          <div className="text-2xl font-normal text-white mt-1">
            {completedCount}
          </div>
        </Card>

        <Card className="border-white/10 p-4">
          <div className="text-xs text-slate-400 font-semibold">Upcoming</div>
          <div className="text-2xl font-normal text-white mt-1">
            {upcomingCount}
          </div>
        </Card>

        <Card className="border-white/10 p-4">
          <div className="text-xs text-slate-400 font-semibold">Ongoing</div>
          <div className="text-2xl font-normal text-white mt-1">
            {ongoingCount}
          </div>
        </Card>
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

      {/* Filter and Search Bar */}
      <Card className="p-4 border-white/10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search exams by name or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-950/70"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Year */}
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Years</option>
              <option value="2026">Year 2026</option>
              <option value="2025">Year 2025</option>
              <option value="2024">Year 2024</option>
            </select>

            {/* Term */}
            <select
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Terms</option>
              <option value="TERM_1">📘 Term 1</option>
              <option value="TERM_2">📗 Term 2</option>
              <option value="TERM_3">📙 Term 3</option>
              <option value="OTHER">🌐 Other / School-wide</option>
            </select>

            {/* Class */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[170px]"
            >
              <option value="ALL">All Classes (39)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-slate-950/70 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Exams Table */}
      <Card className="border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Examination Title</TableHead>
              <TableHead>Class / Grade</TableHead>
              <TableHead>Academic Year & Term</TableHead>
              <TableHead>Exam Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  Loading examinations...
                </TableCell>
              </TableRow>
            ) : filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                  No examination schedules match your selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => (
                <TableRow key={exam.id} className="hover:bg-slate-800/40">
                  {/* Title */}
                  <TableCell>
                    <div className="font-semibold text-white">{exam.name}</div>
                    {exam.description && (
                      <div className="text-xs text-slate-400 max-w-xs truncate">
                        {exam.description}
                      </div>
                    )}
                  </TableCell>

                  {/* Class */}
                  <TableCell>
                    <Badge variant={exam.classId ? "default" : "outline"} className={`font-semibold ${!exam.classId ? "border-amber-500/50 bg-amber-500/10 text-amber-400" : ""}`}>
                      {exam.className || "School-wide"}
                    </Badge>
                  </TableCell>

                  {/* Term & Year */}
                  <TableCell>
                    <div className="font-semibold text-white">
                      {exam.termDisplayName || exam.term}
                    </div>
                    <div className="text-xs text-slate-400">Year {exam.academicYear}</div>
                  </TableCell>

                  {/* Dates */}
                  <TableCell className="text-xs text-slate-300">
                    <div>📅 {exam.startDate}</div>
                    <div className="text-slate-400">🏁 {exam.endDate}</div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>{getStatusBadge(exam.status)}</TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() =>
                          onSelectExamForMarkEntry && onSelectExamForMarkEntry(exam)
                        }
                        className="gap-1 text-indigo-300 hover:text-white border-indigo-500/30 hover:bg-indigo-600/30"
                      >
                        <Edit3 className="h-3 w-3" /> Enter Marks
                      </Button>

                      {(isAdmin || isPrincipal) && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingExam(exam)
                              setIsModalOpen(true)
                            }}
                            className="h-7 w-7 text-slate-400 hover:text-white"
                            title="Edit exam"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteExam(exam.id, exam.name)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete exam"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <ExamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExam}
        examToEdit={editingExam}
        classes={classes}
      />

      <ExamTimetableModal
        isOpen={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
        onSuccess={(result) => {
          setFeedback({
            type: "success",
            message: result?.message || "Examination timetable created successfully!",
          })
          fetchExams()
        }}
        getToken={getToken}
      />
    </div>
  )
}
