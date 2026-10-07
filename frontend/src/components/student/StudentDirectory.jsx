import { useState, useEffect, useCallback } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"

const formatClassName = (cls) => {
  if (!cls) return ""
  const name = cls.name || ""
  if (name.toLowerCase().startsWith("grade")) return name
  if (cls.gradeLevel) {
    if (name.startsWith(String(cls.gradeLevel))) return `Grade ${name}`
    return `Grade ${cls.gradeLevel} - ${name}`
  }
  return `Grade ${name}`
}

export default function StudentDirectory({ onBack }) {
  const { getToken, role, userProfile } = useAuthUser()
  const canEdit = role === "ADMIN" || role === "PRINCIPAL"

  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")
  const [feedback, setFeedback] = useState(null)

  // Auto-preselect teacher's assigned class if role is TEACHER
  useEffect(() => {
    if (role === "TEACHER" && classes.length > 0 && !selectedClassId && userProfile?.id) {
      const myClass = classes.find((c) => c.classTeacherId === userProfile.id)
      if (myClass) {
        setSelectedClassId(String(myClass.id))
      }
    }
  }, [role, classes, selectedClassId, userProfile?.id])

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editStudent, setEditStudent] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    address: "",
    contactNumber: "",
    guardianName: "",
    guardianContact: "",
    classId: "",
    sectionId: "",
    admissionYear: new Date().getFullYear(),
  })

  const fetchClasses = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setClasses(data.data || [])
      }
    } catch (err) {
      console.error("Failed to load classes:", err)
    }
  }, [getToken])

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()
      let url = "http://localhost:8080/api/students?"
      if (query.trim()) url += `query=${encodeURIComponent(query.trim())}&`
      if (selectedClassId) url += `classId=${selectedClassId}&`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setStudents(data.data || [])
      } else {
        const errorMsg = data.error?.message || data.message || "Failed to load students"
        setFeedback({ type: "error", message: errorMsg })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to connect to backend server" })
    } finally {
      setLoading(false)
    }
  }, [getToken, query, selectedClassId])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const cleanGuardianPhone = formData.guardianContact ? formData.guardianContact.trim().replaceAll(/[\s\-()]/g, "") : ""
      if (cleanGuardianPhone && !/^[0-9]{10}$/.test(cleanGuardianPhone)) {
        throw new Error("Guardian contact phone must contain exactly 10 digits (e.g. 0771234567).")
      }
      const cleanStudentPhone = formData.contactNumber ? formData.contactNumber.trim().replaceAll(/[\s\-()]/g, "") : ""
      if (cleanStudentPhone && !/^[0-9]{10}$/.test(cleanStudentPhone)) {
        throw new Error("Student contact phone must contain exactly 10 digits (e.g. 0771234567).")
      }

      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/students", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          contactNumber: cleanStudentPhone || null,
          guardianContact: cleanGuardianPhone || null,
          dob: formData.dob || null,
          classId: formData.classId ? Number(formData.classId) : null,
          sectionId: formData.sectionId ? Number(formData.sectionId) : null,
          admissionYear: Number(formData.admissionYear),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: data.message })
        setShowAddModal(false)
        setFormData({
          firstName: "",
          lastName: "",
          dob: "",
          gender: "Male",
          address: "",
          contactNumber: "",
          guardianName: "",
          guardianContact: "",
          classId: "",
          sectionId: "",
          admissionYear: new Date().getFullYear(),
        })
        fetchStudents()
      } else {
        throw new Error(data.error?.message || data.message || "Registration failed")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const cleanGuardianPhone = editStudent.guardianContact ? editStudent.guardianContact.trim().replaceAll(/[\s\-()]/g, "") : ""
      if (cleanGuardianPhone && !/^[0-9]{10}$/.test(cleanGuardianPhone)) {
        throw new Error("Guardian contact phone must contain exactly 10 digits (e.g. 0771234567).")
      }
      const cleanStudentPhone = editStudent.contactNumber ? editStudent.contactNumber.trim().replaceAll(/[\s\-()]/g, "") : ""
      if (cleanStudentPhone && !/^[0-9]{10}$/.test(cleanStudentPhone)) {
        throw new Error("Student contact phone must contain exactly 10 digits (e.g. 0771234567).")
      }

      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/students/${editStudent.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editStudent.firstName,
          lastName: editStudent.lastName,
          dob: editStudent.dob,
          gender: editStudent.gender,
          address: editStudent.address,
          contactNumber: cleanStudentPhone || null,
          guardianName: editStudent.guardianName,
          guardianContact: cleanGuardianPhone || null,
          classId: editStudent.classId ? Number(editStudent.classId) : null,
          sectionId: editStudent.sectionId ? Number(editStudent.sectionId) : null,
          status: editStudent.status,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: data.message })
        setEditStudent(null)
        fetchStudents()
      } else {
        throw new Error(data.error?.message || "Update failed")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  const handleDelete = async (id, name) => {
    const studentLabel = name ? `student "${name}"` : "this student"
    if (!confirm(`Are you sure you want to remove ${studentLabel}? This will remove the student record from the system.`)) return
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/students/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: data.message || "Student removed successfully" })
        if (selectedStudent && selectedStudent.id === id) {
          setSelectedStudent(null)
        }
        fetchStudents()
      } else {
        throw new Error(data.error?.message || data.message || "Failed to remove student")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b-[0.5px] border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="text-xs h-7 px-2">
                ← Back
              </Button>
            )}
            <h1 className="text-xl sm:text-2xl font-normal tracking-tight text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-[#3b82f6]" /> Student Information Management
            </h1>
          </div>
          <p className="text-xs text-[#858687] mt-1">
            Centralized student registry, admissions, official identity profiles, and academic records.
          </p>
        </div>

        {canEdit && (
          <Button onClick={() => setShowAddModal(true)} className="gap-2 text-xs">
            <UserPlus className="h-4 w-4" /> Register New Student
          </Button>
        )}
      </div>

      {feedback && (
        <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
          {feedback.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-[#4ade80]" />}
          <AlertTitle>{feedback.type === "error" ? "Notice" : "Success"}</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{feedback.message}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedback(null)}
              className="h-6 w-6 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#858687]" />
            <Input
              placeholder="Search by student name or admission number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full h-9 rounded-md border border-white/10 bg-[#191a1d] px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            >
              <option value="">All Classes (Grades 1–13)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatClassName(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={fetchStudents} className="gap-1.5 text-xs w-full">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Students Data Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Admission ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class & Section</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Guardian Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[#858687] text-xs">
                    Loading student records...
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[#858687] text-xs">
                    No student records found matching the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs text-[#3b82f6]">{s.admissionNumber}</TableCell>
                    <TableCell className="font-medium text-white text-xs">{s.fullName}</TableCell>
                    <TableCell className="text-xs text-[#cececf]">
                      {s.className ? `${s.className}${s.sectionName ? ` - ${s.sectionName}` : ""}` : "Unassigned"}
                    </TableCell>
                    <TableCell className="text-xs text-[#858687]">{s.gender || "—"}</TableCell>
                    <TableCell className="text-xs text-[#cececf]">
                      {s.guardianName ? `${s.guardianName} (${s.guardianContact || "No phone"})` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(s)}
                          className="h-7 px-2 text-xs gap-1 text-[#858687] hover:text-white"
                          title="View Profile"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>
                        {canEdit && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditStudent(s)}
                              className="h-7 px-2 text-xs gap-1 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              title="Edit Details"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(s.id, s.fullName)}
                              className="h-7 px-2 text-xs gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              title="Remove Student"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
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

      {/* Register New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-normal text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#3b82f6]" /> Register New Student Admission
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#858687] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">First Name *</label>
                  <Input
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="text-xs"
                    placeholder="e.g. Kasun"
                  />
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Last Name *</label>
                  <Input
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="text-xs"
                    placeholder="e.g. Perera"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">Date of Birth * (Min 5 Years)</label>
                  <Input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-9 rounded-md border border-white/10 bg-[#131416] px-3 py-1 text-xs text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">Assigned Class</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full h-9 rounded-md border border-white/10 bg-[#131416] px-3 py-1 text-xs text-white"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {formatClassName(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Admission Year</label>
                  <Input
                    type="number"
                    value={formData.admissionYear}
                    onChange={(e) => setFormData({ ...formData, admissionYear: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#cececf] block mb-1">Residential Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="text-xs"
                  placeholder="Street Address, City"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">Guardian Name</label>
                  <Input
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="text-xs"
                    placeholder="Father/Mother/Guardian"
                  />
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Guardian Phone (10 Digits)</label>
                  <Input
                    type="tel"
                    maxLength={10}
                    value={formData.guardianContact}
                    onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                    className="text-xs"
                    placeholder="0771234567"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#cececf] block mb-1">Student Contact Phone (Optional - 10 Digits)</label>
                <Input
                  type="tel"
                  maxLength={10}
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="text-xs"
                  placeholder="0711234567"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gap-1.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Submit Admission
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#3b82f6]" />
                <h2 className="text-base font-normal text-white">Student Profile Record</h2>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-[#858687] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded bg-[#131416]">
                <span className="text-[#858687]">Admission Number</span>
                <span className="font-mono text-[#3b82f6]">{selectedStudent.admissionNumber}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded bg-[#131416]">
                <span className="text-[#858687]">Full Legal Name</span>
                <span className="text-white font-medium">{selectedStudent.fullName}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded bg-[#131416]">
                <span className="text-[#858687]">Date of Birth</span>
                <span className="text-white">{selectedStudent.dob || "—"}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded bg-[#131416]">
                <span className="text-[#858687]">Enrolled Class</span>
                <span className="text-[#4ade80]">{selectedStudent.className || "Unassigned"}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded bg-[#131416]">
                <span className="text-[#858687]">Guardian</span>
                <span className="text-white">{selectedStudent.guardianName || "—"}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded bg-[#131416]">
                <span className="text-[#858687]">Guardian Phone</span>
                <span className="text-white">{selectedStudent.guardianContact || "—"}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded bg-[#131416]">
                <span className="text-[#858687]">Residential Address</span>
                <span className="text-white">{selectedStudent.address || "—"}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded bg-[#131416]">
                <span className="text-[#858687]">Status</span>
                <Badge variant={selectedStudent.status === "ACTIVE" ? "success" : "secondary"}>
                  {selectedStudent.status}
                </Badge>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const st = selectedStudent
                      setSelectedStudent(null)
                      setEditStudent(st)
                    }}
                    className="gap-1.5 text-xs text-blue-400 hover:text-blue-300 border-blue-500/30 hover:bg-blue-500/10"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const id = selectedStudent.id
                      const name = selectedStudent.fullName
                      handleDelete(id, name)
                    }}
                    className="gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove Student
                  </Button>
                </div>
              )}
              <Button size="sm" variant="outline" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#18191b] border border-white/10 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-normal text-white flex items-center gap-2">
                <Edit className="h-4 w-4 text-[#3b82f6]" /> Edit Student Record ({editStudent.admissionNumber})
              </h2>
              <button onClick={() => setEditStudent(null)} className="text-[#858687] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">First Name</label>
                  <Input
                    required
                    value={editStudent.firstName}
                    onChange={(e) => setEditStudent({ ...editStudent, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Last Name</label>
                  <Input
                    required
                    value={editStudent.lastName}
                    onChange={(e) => setEditStudent({ ...editStudent, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">Assigned Class</label>
                  <select
                    value={editStudent.classId || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, classId: e.target.value })}
                    className="w-full h-9 rounded-md border border-white/10 bg-[#131416] px-3 py-1 text-xs text-white"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {formatClassName(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Status</label>
                  <select
                    value={editStudent.status}
                    onChange={(e) => setEditStudent({ ...editStudent, status: e.target.value })}
                    className="w-full h-9 rounded-md border border-white/10 bg-[#131416] px-3 py-1 text-xs text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="GRADUATED">GRADUATED</option>
                    <option value="TRANSFERRED">TRANSFERRED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#cececf] block mb-1">Address</label>
                <Input
                  value={editStudent.address || ""}
                  onChange={(e) => setEditStudent({ ...editStudent, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#cececf] block mb-1">Guardian Name</label>
                  <Input
                    value={editStudent.guardianName || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, guardianName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[#cececf] block mb-1">Guardian Phone (10 Digits)</label>
                  <Input
                    type="tel"
                    maxLength={10}
                    value={editStudent.guardianContact || ""}
                    onChange={(e) => setEditStudent({ ...editStudent, guardianContact: e.target.value })}
                    placeholder="0771234567"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#cececf] block mb-1">Student Contact Phone (Optional - 10 Digits)</label>
                <Input
                  type="tel"
                  maxLength={10}
                  value={editStudent.contactNumber || ""}
                  onChange={(e) => setEditStudent({ ...editStudent, contactNumber: e.target.value })}
                  placeholder="0711234567"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditStudent(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
