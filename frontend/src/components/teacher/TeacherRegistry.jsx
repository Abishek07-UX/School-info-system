import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  GraduationCap,
  BookOpen,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  Search,
  Eye,
  Edit,
  MapPin,
  Clock,
  Briefcase,
  Award,
  Calendar,
  Filter,
  Users,
} from "lucide-react"

export default function TeacherRegistry({ onBack, onNavigateToTimetable }) {
  const { getToken, role } = useAuthUser()
  const canAssign = role === "ADMIN" || role === "PRINCIPAL"

  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassFilter, setSelectedClassFilter] = useState("")

  // Assignment Modal
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState(null)
  const [assignData, setAssignData] = useState({ subjectId: "", classId: "" })

  // View Teacher Profile Modal
  const [viewingTeacher, setViewingTeacher] = useState(null)

  // Edit Teacher Information Modal
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [editFormData, setEditFormData] = useState({
    phoneNumber: "",
    address: "",
    qualification: "",
    subjectSpecialization: "",
    teachingHistory: "",
    availability: "",
    employmentStatus: "ACTIVE",
  })
  const [savingEdit, setSavingEdit] = useState(false)

  const fetchLookups = useCallback(async () => {
    try {
      const token = await getToken()
      const [classRes, subjectRes] = await Promise.all([
        fetch("http://localhost:8080/api/classes", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8080/api/subjects", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const [cData, sData] = await Promise.all([classRes.json(), subjectRes.json()])
      if (cData.success) setClasses(cData.data || [])
      if (sData.success) setSubjects(sData.data || [])
    } catch (err) {
      console.error("Failed to load lookups:", err)
    }
  }, [getToken])

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setTeachers(data.data || [])
      } else {
        setFeedback({ type: "error", message: data?.error?.message || "Failed to load teaching faculty records" })
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to load teaching faculty records" })
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchLookups()
    fetchTeachers()
  }, [fetchLookups, fetchTeachers])

  // Open Edit Modal
  const handleOpenEdit = (teacher) => {
    setEditingTeacher(teacher)
    setEditFormData({
      phoneNumber: teacher.phoneNumber || "",
      address: teacher.address || "",
      qualification: teacher.qualification || "",
      subjectSpecialization: teacher.subjectSpecialization || teacher.subject || "",
      teachingHistory: teacher.teachingHistory || "",
      availability: teacher.availability || "Full-time (Mon-Fri)",
      employmentStatus: teacher.employmentStatus || teacher.status || "ACTIVE",
    })
  }

  // Submit Edit Teacher Form
  const handleUpdateTeacher = async (e) => {
    e.preventDefault()
    if (!editingTeacher) return
    try {
      setSavingEdit(true)
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/teachers/${editingTeacher.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: `Updated details for ${editingTeacher.name || "teacher"}` })
        setEditingTeacher(null)
        if (viewingTeacher && viewingTeacher.id === editingTeacher.id) {
          setViewingTeacher(data.data)
        }
        fetchTeachers()
      } else {
        throw new Error(data.error?.message || "Failed to update teacher information")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setSavingEdit(false)
    }
  }

  // Handle Assign Subject
  const handleAssignSubject = async (e) => {
    e.preventDefault()
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/teachers/${selectedTeacherForAssign.id}/subjects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectId: Number(assignData.subjectId),
          classId: Number(assignData.classId),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: data.message || "Subject assigned successfully!" })
        setSelectedTeacherForAssign(null)
        setAssignData({ subjectId: "", classId: "" })
        fetchTeachers()
      } else {
        throw new Error(data.error?.message || "Failed to assign subject")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  // Handle Remove Assignment
  const handleRemoveAssignment = async (assignmentId) => {
    if (!confirm("Are you sure you want to remove this subject assignment?")) return
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/teachers/subjects/${assignmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: data.message || "Subject assignment removed successfully." })
        fetchTeachers()
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.nicNumber && t.nicNumber.toLowerCase().includes(q)) ||
        (t.subjectSpecialization && t.subjectSpecialization.toLowerCase().includes(q)) ||
        (t.qualification && t.qualification.toLowerCase().includes(q))

      const matchesClass =
        !selectedClassFilter ||
        (t.assignments && t.assignments.some((a) => String(a.classId) === String(selectedClassFilter))) ||
        (t.assignedClass && t.assignedClass.toLowerCase().includes(selectedClassFilter.toLowerCase()))

      return matchesSearch && matchesClass
    })
  }, [teachers, searchTerm, selectedClassFilter])

  // Aggregate statistics
  const totalAllocations = useMemo(() => {
    return teachers.reduce((sum, t) => sum + (t.assignments ? t.assignments.length : 0), 0)
  }, [teachers])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-[0.5px] border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="text-xs h-7 px-2">
                ← Back
              </Button>
            )}
            <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#3b82f6]" /> Teacher & Faculty Management
            </h1>
          </div>
          <p className="text-xs text-[#858687] mt-1">
            Maintain staff records, subject specializations, qualifications, and class curriculum allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTeachers} className="gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Faculty
          </Button>
        </div>
      </div>

      {feedback && (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          {feedback.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-[#4ade80]" />}
          <AlertTitle>{feedback.type === "error" ? "Notice" : "Success"}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 bg-[#131416]/70 border-white/10">
          <div className="text-[11px] text-[#858687] flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[#3b82f6]" /> Faculty Headcount
          </div>
          <div className="text-xl font-medium text-white mt-1">{teachers.length}</div>
          <div className="text-[10px] text-[#858687] mt-0.5">Appointed teaching staff</div>
        </Card>

        <Card className="p-3.5 bg-[#131416]/70 border-white/10">
          <div className="text-[11px] text-[#858687] flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> Subject Allocations
          </div>
          <div className="text-xl font-medium text-white mt-1">{totalAllocations}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">Active curriculum links</div>
        </Card>

        <Card className="p-3.5 bg-[#131416]/70 border-white/10">
          <div className="text-[11px] text-[#858687] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Classes Covered
          </div>
          <div className="text-xl font-medium text-white mt-1">{classes.length}</div>
          <div className="text-[10px] text-[#858687] mt-0.5">Across Grades 1–13</div>
        </Card>

        <Card className="p-3.5 bg-[#131416]/70 border-white/10">
          <div className="text-[11px] text-[#858687] flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-400" /> Teaching Specializations
          </div>
          <div className="text-xl font-medium text-white mt-1">{subjects.length}</div>
          <div className="text-[10px] text-[#858687] mt-0.5">Curriculum disciplines</div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3 bg-[#131416]/60 border-white/10">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#858687]" />
            <Input
              type="text"
              placeholder="Search faculty by name, email, NIC, qualification, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-[#18191b] border-white/10 text-white placeholder:text-[#858687]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-[#858687] shrink-0" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="h-9 rounded-md border border-white/10 bg-[#18191b] px-3 py-1 text-xs text-white focus:outline-none w-full sm:w-48"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Teachers Table (View Teacher Records) */}
      <Card className="border-white/10 bg-[#131416]">
        <CardHeader className="p-4 border-b border-white/10">
          <CardTitle className="text-base text-white font-normal flex items-center justify-between">
            <span>Faculty Roster ({filteredTeachers.length})</span>
            {searchTerm || selectedClassFilter ? (
              <span className="text-xs text-[#858687]">Filtered results</span>
            ) : null}
          </CardTitle>
          <CardDescription className="text-xs text-[#858687]">
            Running staff records, academic qualifications, and subject assignments across all 3 terms.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-xs text-[#858687]">Teacher Name & NIC</TableHead>
                <TableHead className="text-xs text-[#858687]">Contact Information</TableHead>
                <TableHead className="text-xs text-[#858687]">Specialization & Qualifications</TableHead>
                <TableHead className="text-xs text-[#858687]">Assigned Curriculum Subjects</TableHead>
                <TableHead className="text-xs text-[#858687]">Status</TableHead>
                <TableHead className="text-right text-xs text-[#858687]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#858687] text-xs">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#3b82f6]" />
                    Loading faculty registry...
                  </TableCell>
                </TableRow>
              ) : filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#858687] text-xs">
                    No faculty members found matching your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((t) => (
                  <TableRow key={t.id} className="border-white/10 hover:bg-white/[0.02]">
                    <TableCell>
                      <div className="font-medium text-white text-xs">{t.name}</div>
                      <div className="text-[11px] text-[#858687] flex items-center gap-1.5 mt-0.5">
                        <span>NIC: {t.nicNumber || "—"}</span>
                        {t.assignedClass && (
                          <span className="text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded text-[10px]">
                            {t.assignedClass.split(",")[0]}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-[#cececf] flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-[#858687]" /> {t.email}
                      </div>
                      <div className="text-[11px] text-[#858687] flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3 text-[#858687]" /> {t.phoneNumber || "No phone"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-white">
                        {t.qualification || "Qualified Teaching Faculty"}
                      </div>
                      <div className="text-[11px] text-[#858687] flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="h-3 w-3 text-[#858687]" />
                        <span>{t.subjectSpecialization || t.subject || "General Faculty"}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {t.assignments && t.assignments.length > 0 ? (
                          t.assignments.map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-[#1f2023] border border-white/10 text-white"
                            >
                              <BookOpen className="h-3 w-3 text-[#3b82f6]" />
                              {a.subjectName} ({a.className})
                              {canAssign && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAssignment(a.id)}
                                  className="ml-1 text-[#858687] hover:text-[#ef4444]"
                                  title="Unassign"
                                >
                                  &times;
                                </button>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#858687] italic">No subjects assigned yet</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={t.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                        {t.status || "ACTIVE"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingTeacher(t)}
                          className="text-[#858687] hover:text-white hover:bg-white/10 h-7 px-2 gap-1 text-xs"
                          title="View Teacher Profile & History"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>

                        {canAssign && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(t)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 px-2 gap-1 text-xs font-medium"
                              title="Edit Personal Information & Qualifications"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTeacherForAssign(t)
                                setAssignData({ subjectId: "", classId: "" })
                              }}
                              className="gap-1 text-xs h-7 px-2 border-white/10"
                              title="Assign Subject and Class"
                            >
                              <Plus className="h-3.5 w-3.5" /> Assign
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
        </CardContent>
      </Card>

      {/* MODAL 1: VIEW TEACHER PROFILE & RUNNING RECORD */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-medium text-lg">
                  {viewingTeacher.name?.charAt(0) || "T"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-normal text-white">{viewingTeacher.name}</h2>
                    <Badge variant="success" className="text-[10px]">
                      {viewingTeacher.status || "ACTIVE"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#858687] mt-0.5">
                    Faculty ID: #{viewingTeacher.id} &bull; {viewingTeacher.subjectSpecialization || viewingTeacher.subject || "Faculty Member"}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingTeacher(null)} className="text-[#858687] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Details */}
              <Card className="p-4 bg-[#131416]/70 border-white/10 space-y-2.5">
                <h3 className="text-xs font-medium text-white flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-[#3b82f6]" /> Personal & Contact Details
                </h3>
                <div className="text-xs space-y-1.5 pt-1 text-[#cececf]">
                  <div className="flex justify-between">
                    <span className="text-[#858687]">Email Address:</span>
                    <span>{viewingTeacher.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#858687]">Phone:</span>
                    <span>{viewingTeacher.phoneNumber || "Not recorded"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#858687]">NIC Number:</span>
                    <span>{viewingTeacher.nicNumber || "Not recorded"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#858687]">Residential Address:</span>
                    <span className="text-right max-w-[180px] truncate">{viewingTeacher.address || "Sri Lanka"}</span>
                  </div>
                </div>
              </Card>

              {/* Qualifications & Employment */}
              <Card className="p-4 bg-[#131416]/70 border-white/10 space-y-2.5">
                <h3 className="text-xs font-medium text-white flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-400" /> Qualifications & Status
                </h3>
                <div className="text-xs space-y-1.5 pt-1 text-[#cececf]">
                  <div className="flex justify-between">
                    <span className="text-[#858687]">Highest Qualification:</span>
                    <span className="text-right text-white font-medium max-w-[180px]">
                      {viewingTeacher.qualification || "Qualified Faculty"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#858687]">Specialization:</span>
                    <span>{viewingTeacher.subjectSpecialization || viewingTeacher.subject || "General"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#858687]">Availability:</span>
                    <span>{viewingTeacher.availability || "Full-time (Mon-Fri)"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#858687]">Employment Status:</span>
                    <span className="text-emerald-400 font-medium">
                      {viewingTeacher.employmentStatus || viewingTeacher.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Teaching History & Running Record */}
            <Card className="p-4 bg-[#131416]/70 border-white/10 space-y-2.5">
              <h3 className="text-xs font-medium text-white flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" /> Teaching History & Running Record
              </h3>
              <p className="text-xs text-[#cececf] leading-relaxed">
                {viewingTeacher.teachingHistory ||
                  "Appointed teaching faculty. Conducting scheduled lectures, practical assessments, and term evaluations."}
              </p>
              {viewingTeacher.assignedClass && (
                <div className="text-xs text-[#858687] pt-1 border-t border-white/5 flex items-center gap-2">
                  <span>Assigned Classes:</span>
                  <span className="text-white font-medium">{viewingTeacher.assignedClass}</span>
                </div>
              )}
            </Card>

            {/* Current Active Allocations */}
            <Card className="p-4 bg-[#131416]/70 border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-white flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-400" /> Current Subject Allocations ({viewingTeacher.assignments?.length || 0})
                </h3>
                {canAssign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTeacherForAssign(viewingTeacher)
                      setAssignData({ subjectId: "", classId: "" })
                    }}
                    className="h-6 text-[11px] px-2 gap-1 border-white/10"
                  >
                    <Plus className="h-3 w-3" /> Add Allocation
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {viewingTeacher.assignments && viewingTeacher.assignments.length > 0 ? (
                  viewingTeacher.assignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#18191b] border border-white/10 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-[#3b82f6]" />
                        <div>
                          <div className="text-white font-medium">{a.subjectName}</div>
                          <div className="text-[10px] text-[#858687]">{a.className}</div>
                        </div>
                      </div>
                      {canAssign && (
                        <button
                          onClick={async () => {
                            await handleRemoveAssignment(a.id)
                            setViewingTeacher({
                              ...viewingTeacher,
                              assignments: viewingTeacher.assignments.filter((as) => as.id !== a.id),
                            })
                          }}
                          className="text-[#858687] hover:text-[#ef4444] text-xs px-1.5"
                          title="Unassign"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#858687] italic col-span-2 py-2">
                    No active subject allocations assigned to this teacher.
                  </div>
                )}
              </div>
            </Card>

            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-[11px] text-[#858687]">
                Subject allocations directly control marks entry and attendance rights.
              </span>

              <div className="flex items-center gap-2">
                {canAssign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleOpenEdit(viewingTeacher)
                    }}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Information
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setViewingTeacher(null)}
                  className="text-xs h-8 px-4"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT TEACHER INFORMATION (Manage Teacher Information) */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-normal text-white flex items-center gap-2">
                <Edit className="h-4 w-4 text-[#3b82f6]" /> Manage Teacher Information: {editingTeacher.name}
              </h2>
              <button onClick={() => setEditingTeacher(null)} className="text-[#858687] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeacher} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">Phone Number</label>
                  <Input
                    type="text"
                    value={editFormData.phoneNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    placeholder="0771234567"
                    className="h-8 text-xs bg-[#131416] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Employment Status</label>
                  <select
                    value={editFormData.employmentStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, employmentStatus: e.target.value })}
                    className="w-full h-8 rounded-md border border-white/10 bg-[#131416] px-3 py-1 text-xs text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PERMANENT">PERMANENT</option>
                    <option value="PROBATION">PROBATION</option>
                    <option value="CONTRACT">CONTRACT</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#cececf] block mb-1">Highest Qualification / Degree</label>
                <Input
                  type="text"
                  value={editFormData.qualification}
                  onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                  placeholder="e.g. B.Sc. Mathematics & Science Education (First Class Hons)"
                  className="h-8 text-xs bg-[#131416] border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">Subject Specialization</label>
                  <Input
                    type="text"
                    value={editFormData.subjectSpecialization}
                    onChange={(e) => setEditFormData({ ...editFormData, subjectSpecialization: e.target.value })}
                    placeholder="e.g. Mathematics, Science"
                    className="h-8 text-xs bg-[#131416] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Availability Schedule</label>
                  <Input
                    type="text"
                    value={editFormData.availability}
                    onChange={(e) => setEditFormData({ ...editFormData, availability: e.target.value })}
                    placeholder="e.g. Full-time (Mon-Fri)"
                    className="h-8 text-xs bg-[#131416] border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#cececf] block mb-1">Residential Address</label>
                <Input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="e.g. No. 45, Temple Road, Colombo"
                  className="h-8 text-xs bg-[#131416] border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-[#cececf] block mb-1">Teaching History & Experience Notes</label>
                <textarea
                  rows={3}
                  value={editFormData.teachingHistory}
                  onChange={(e) => setEditFormData({ ...editFormData, teachingHistory: e.target.value })}
                  placeholder="Record of subjects and classes handled over time..."
                  className="w-full rounded-md border border-white/10 bg-[#131416] p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTeacher(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={savingEdit} className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {savingEdit ? "Saving..." : "Save Information"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN SUBJECT TO TEACHER (Assign Subjects) */}
      {selectedTeacherForAssign && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-normal text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#3b82f6]" /> Allocate Curriculum Subject
              </h2>
              <button onClick={() => setSelectedTeacherForAssign(null)} className="text-[#858687] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#858687]">
              Allocating a subject to <strong className="text-white">{selectedTeacherForAssign.name}</strong> will grant them rights to record attendance and enter marks for that class.
            </p>

            <form onSubmit={handleAssignSubject} className="space-y-4 text-xs">
              <div>
                <label className="text-[#cececf] block mb-1.5">Select Subject *</label>
                <select
                  required
                  value={assignData.subjectId}
                  onChange={(e) => setAssignData({ ...assignData, subjectId: e.target.value })}
                  className="w-full h-9 rounded-md border border-white/10 bg-[#131416] px-3 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - Grade {s.gradeLevel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#cececf] block mb-1.5">Select Class/Grade *</label>
                <select
                  required
                  value={assignData.classId}
                  onChange={(e) => setAssignData({ ...assignData, classId: e.target.value })}
                  className="w-full h-9 rounded-md border border-white/10 bg-[#131416] px-3 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTeacherForAssign(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Allocation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
