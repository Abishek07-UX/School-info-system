import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { StatTile } from "@/components/ui/stat-tile"
import { FilterBar, FilterField, SearchInput } from "@/components/ui/filter-bar"
import { TableEmptyRow } from "@/components/ui/empty-state"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/context/ToastContext"
import { useConfirm } from "@/context/ConfirmContext"
import { formatDateRange } from "@/lib/format"
import {
  Calendar,
  CalendarClock,
  CalendarCheck2,
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  Edit3,
  RefreshCw,
  Eye,
  Hourglass,
  SearchX,
} from "lucide-react"
import ExamModal from "./ExamModal"
import ExamTimetableModal from "./ExamTimetableModal"

export default function ExamManagementTab({ classes, onSelectExamForMarkEntry }) {
  const { getToken, isAdmin, isPrincipal } = useAuthUser()
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()))
  const [filterTerm, setFilterTerm] = useState("ALL")
  const [filterClass, setFilterClass] = useState("ALL")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [searchTerm, setSearchTerm] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false)
  const [editingExam, setEditingExam] = useState(null)
  const toast = useToast()
  const confirm = useConfirm()
  const latestFetch = useRef(0)

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const yearsSet = new Set([
      currentYear - 2,
      currentYear - 1,
      currentYear,
      currentYear + 1,
      currentYear + 2,
      currentYear + 3,
      currentYear + 4,
      2024,
      2025,
      2026,
      2027,
      2028,
      2029,
      2030,
    ])
    exams.forEach((e) => {
      if (e.academicYear) yearsSet.add(e.academicYear)
    })
    return Array.from(yearsSet).sort((a, b) => b - a)
  }, [exams])

  const fetchExams = useCallback(async () => {
    const fetchId = ++latestFetch.current
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
      if (fetchId === latestFetch.current) setExams(data || [])
    } catch (err) {
      if (fetchId === latestFetch.current) {
        toast.error(err.message || "Failed to load examinations.")
      }
    } finally {
      if (fetchId === latestFetch.current) setLoading(false)
    }
  }, [filterYear, filterTerm, filterClass, filterStatus, getToken, toast])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const handleSaveExam = async (formData) => {
    if (!editingExam && formData.classId && formData.term !== "OTHER") {
      const selectedClass = classes.find((schoolClass) => Number(schoolClass.id) === Number(formData.classId))
      const existingExams = await academicService.getExams({
        academicYear: formData.academicYear,
        term: formData.term,
      }, getToken)
      if (selectedClass && (existingExams || []).some((exam) =>
        exam.classId != null && Number(exam.gradeLevel) === Number(selectedClass.gradeLevel)
        && Number(exam.academicYear) === Number(formData.academicYear) && exam.term === formData.term
      )) {
        throw new Error(`Grade ${selectedClass.gradeLevel} already has a ${formData.term.replace("TERM_", "Term ")} exam scheduled for ${formData.academicYear}. Choose another term or academic year.`)
      }
    }
    if (editingExam) {
      await academicService.updateExam(editingExam.id, formData, getToken)
      toast.success("Examination schedule updated successfully!")
    } else {
      await academicService.createExam(formData, getToken)
      toast.success("New examination scheduled successfully!")
    }
    fetchExams()
  }

  const handleDeleteExam = async (examId, examName) => {
    const ok = await confirm({
      title: `Delete "${examName}"?`,
      description: "All marks recorded for this exam will also be removed. This can't be undone.",
      confirmLabel: "Delete exam",
      tone: "danger",
    })
    if (!ok) return
    try {
      await academicService.deleteExam(examId, getToken)
      toast.success(`Examination "${examName}" deleted.`)
      setExams((prev) => prev.filter((e) => e.id !== examId))
    } catch (err) {
      toast.error(err.message || "Failed to delete examination.")
    }
  }

  const STATUS_BADGES = {
    COMPLETED: { variant: "success", label: "Completed" },
    ONGOING: { variant: "info", label: "Ongoing" },
    UPCOMING: { variant: "warning", label: "Upcoming" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
  }
  const getStatusBadge = (status) => {
    const badge = STATUS_BADGES[status]
    return badge ? (
      <Badge variant={badge.variant} dot>
        {badge.label}
      </Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    )
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

  const currentYear = String(new Date().getFullYear())
  const activeFilterCount =
    (filterYear !== currentYear ? 1 : 0) +
    (filterTerm !== "ALL" ? 1 : 0) +
    (filterClass !== "ALL" ? 1 : 0) +
    (filterStatus !== "ALL" ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0)
  const clearFilters = () => {
    setFilterYear(currentYear)
    setFilterTerm("ALL")
    setFilterClass("ALL")
    setFilterStatus("ALL")
    setSearchTerm("")
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Schedule term exams for Grades 1–13 and jump straight into mark entry."
            : "Browse term exams across Grades 1–13 and open their marks."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon-sm" onClick={fetchExams} disabled={loading} aria-label="Refresh exams">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>

          {isAdmin && (
            <>
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
              <Button
                size="sm"
                onClick={() => {
                  setEditingExam(null)
                  setIsTimetableModalOpen(true)
                }}
                className="gap-1.5"
              >
                <Calendar className="h-4 w-4" /> Create Exam Timetable
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={ClipboardList} label="Total scheduled" value={exams.length} tone="blue" />
        <StatTile icon={CalendarCheck2} label="Completed" value={completedCount} tone="green" />
        <StatTile icon={CalendarClock} label="Upcoming" value={upcomingCount} tone="amber" />
        <StatTile icon={Hourglass} label="Ongoing" value={ongoingCount} tone="neutral" />
      </div>

      {/* Filters */}
      <FilterBar
        activeCount={activeFilterCount}
        onClear={clearFilters}
        summary={!loading && `${filteredExams.length} ${filteredExams.length === 1 ? "exam" : "exams"}`}
      >
        <FilterField label="Search" htmlFor="exam-search" className="w-full sm:w-64 sm:flex-none">
          <SearchInput id="exam-search" value={searchTerm} onChange={setSearchTerm} placeholder="Exam name or class…" />
        </FilterField>
        <FilterField label="Year" htmlFor="exam-year" className="sm:w-28">
          <select id="exam-year" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="h-9 w-full px-3 text-sm">
            <option value="ALL">All years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Term" htmlFor="exam-term" className="sm:w-40">
          <select id="exam-term" value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} className="h-9 w-full px-3 text-sm">
            <option value="ALL">All terms</option>
            <option value="TERM_1">Term 1</option>
            <option value="TERM_2">Term 2</option>
            <option value="TERM_3">Term 3</option>
            <option value="OTHER">Other / School-wide</option>
          </select>
        </FilterField>
        <FilterField label="Class" htmlFor="exam-class" className="sm:w-40">
          <select id="exam-class" value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="h-9 w-full px-3 text-sm">
            <option value="ALL">All classes ({classes.length})</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FilterField>
        <FilterField label="Status" htmlFor="exam-status" className="sm:w-36">
          <select id="exam-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 w-full px-3 text-sm">
            <option value="ALL">All statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </FilterField>
      </FilterBar>

      {/* Exams */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Examination</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }, (_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="ml-auto h-7 w-28" /></TableCell>
              </TableRow>
            ))
          ) : filteredExams.length === 0 ? (
            <TableEmptyRow
              colSpan={6}
              icon={activeFilterCount ? SearchX : ClipboardList}
              title={activeFilterCount ? "No examination schedules match your selected filters." : "No exams scheduled yet"}
              description={
                activeFilterCount
                  ? "Try another term or class, or clear the filters."
                  : isAdmin
                    ? "Create an exam timetable to schedule a term exam for a whole grade."
                    : "Exams will appear here once an administrator schedules them."
              }
              action={
                activeFilterCount ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null
              }
            />
          ) : (
            filteredExams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="min-w-[220px]">
                  <div className="font-medium text-foreground">{exam.name}</div>
                  {exam.description && (
                    <div className="max-w-xs truncate text-xs text-muted-foreground">{exam.description}</div>
                  )}
                </TableCell>
                <TableCell>
                  {exam.classId ? (
                    <Badge variant="secondary">{exam.className}</Badge>
                  ) : (
                    <Badge variant="warning">School-wide</Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-foreground">{exam.termDisplayName || exam.term}</div>
                  <div className="text-xs text-muted-foreground">{exam.academicYear}</div>
                </TableCell>
                <TableCell className="tabular whitespace-nowrap text-foreground-2">
                  {formatDateRange(exam.startDate, exam.endDate)}
                </TableCell>
                <TableCell>{getStatusBadge(exam.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="xs"
                      variant="accent"
                      onClick={() => onSelectExamForMarkEntry && onSelectExamForMarkEntry(exam)}
                      className="gap-1.5"
                    >
                      {isPrincipal ? (
                        <><Eye className="h-3.5 w-3.5" /> View Marks</>
                      ) : (
                        <><Edit3 className="h-3.5 w-3.5" /> Enter Marks</>
                      )}
                    </Button>

                    {isAdmin && (
                      <>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingExam(exam)
                            setIsTimetableModalOpen(true)
                          }}
                          title="Edit exam timetable"
                          aria-label="Edit exam timetable"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDeleteExam(exam.id, exam.name)}
                          className="hover:bg-danger-soft hover:text-danger"
                          title="Delete exam"
                          aria-label="Delete exam"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <ExamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingExam(null)
        }}
        onSave={handleSaveExam}
        examToEdit={editingExam}
        classes={classes}
      />

      <ExamTimetableModal
        isOpen={isTimetableModalOpen}
        onClose={() => {
          setIsTimetableModalOpen(false)
          setEditingExam(null)
        }}
        onSuccess={(result) => {
          toast.success(result?.message || (editingExam ? "Examination timetable updated successfully!" : "Examination timetable created successfully!"))
          fetchExams()
        }}
        getToken={getToken}
        initialGrade={classes.find((c) => String(c.id) === filterClass)?.gradeLevel || 10}
        initialClassId={filterClass === "ALL" ? null : filterClass}
        initialTerm={["TERM_1", "TERM_2", "TERM_3"].includes(filterTerm) ? filterTerm : "TERM_1"}
        initialAcademicYear={filterYear === "ALL" ? new Date().getFullYear() : Number(filterYear)}
        examToEdit={editingExam}
      />
    </div>
  )
}
