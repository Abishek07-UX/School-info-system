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
  CalendarCheck,
  Users,
  GraduationCap,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Trash2,
  Eye,
  Calendar,
  Printer,
  X,
  TrendingUp,
  FileText,
} from "lucide-react"

export default function AttendanceHub({ onBack }) {
  const { getToken, role, userProfile } = useAuthUser()
  const [activeSubTab, setActiveSubTab] = useState("students") // "students" | "teachers" | "analytics"

  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0])

  const [studentRecords, setStudentRecords] = useState([])
  const [isSessionRecorded, setIsSessionRecorded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // 5-Day Student Attendance History Modal
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null)
  const [studentHistoryRecords, setStudentHistoryRecords] = useState([])
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Teacher attendance state
  const [teacherRecords, setTeacherRecords] = useState([])
  const [analytics, setAnalytics] = useState(null)

  const fetchClasses = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data && data.data.length > 0) {
        setClasses(data.data)
        if (!selectedClassId) {
          const myClass = data.data.find((c) => c.classTeacherId === userProfile?.id)
          setSelectedClassId(String(myClass ? myClass.id : data.data[0].id))
        }
      }
    } catch (err) {
      console.error("Failed to load classes:", err)
    }
  }, [getToken, selectedClassId, userProfile?.id])

  const loadStudentAttendance = useCallback(async () => {
    if (!selectedClassId) return
    try {
      setLoading(true)
      setFeedback(null)
      const token = await getToken()

      // 1. Load students in class
      const stuRes = await fetch(`http://localhost:8080/api/students?classId=${selectedClassId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const stuData = await stuRes.json()
      const studentsInClass = stuData.success ? stuData.data || [] : []

      // 2. Load existing attendance for date
      const attRes = await fetch(
        `http://localhost:8080/api/attendance/students?classId=${selectedClassId}&date=${attendanceDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const attData = await attRes.json()
      const existingAtt = attData.success ? attData.data || [] : []

      setIsSessionRecorded(existingAtt.length > 0)

      const attMap = new Map()
      existingAtt.forEach((a) => attMap.set(a.studentId, a))

      const merged = studentsInClass.map((s) => {
        const recorded = attMap.get(s.id)
        return {
          studentId: s.id,
          admissionNumber: s.admissionNumber,
          fullName: s.fullName,
          status: recorded ? recorded.status : "PRESENT",
          remarks: recorded ? recorded.remarks || "" : "",
          isRecorded: !!recorded,
        }
      })

      setStudentRecords(merged)
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to load class attendance sheet" })
    } finally {
      setLoading(false)
    }
  }, [getToken, selectedClassId, attendanceDate])

  const loadTeacherAttendance = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const [tRes, attRes] = await Promise.all([
        fetch("http://localhost:8080/api/teachers", { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`http://localhost:8080/api/attendance/teachers?date=${attendanceDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const [tData, attData] = await Promise.all([tRes.json(), attRes.json()])

      const teachers = tData.success ? tData.data || [] : []
      const existing = attData.success ? attData.data || [] : []
      const attMap = new Map()
      existing.forEach((a) => attMap.set(a.teacherId, a))

      const merged = teachers.map((t) => {
        const recorded = attMap.get(t.id)
        return {
          teacherId: t.id,
          name: t.name,
          checkInTime: recorded ? recorded.checkInTime || "07:30" : "07:30",
          checkOutTime: recorded ? recorded.checkOutTime || "13:30" : "13:30",
          status: recorded ? recorded.status : "PRESENT",
          note: recorded ? recorded.note || "" : "",
        }
      })

      setTeacherRecords(merged)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [getToken, attendanceDate])

  const loadAnalytics = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/attendance/reports?date=${attendanceDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setAnalytics(data.data)
      }
    } catch (err) {
      console.error("Failed to load analytics:", err)
    }
  }, [getToken, attendanceDate])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  useEffect(() => {
    if (activeSubTab === "students") {
      loadStudentAttendance()
    } else if (activeSubTab === "teachers") {
      loadTeacherAttendance()
    } else if (activeSubTab === "analytics") {
      loadAnalytics()
    }
  }, [activeSubTab, loadStudentAttendance, loadTeacherAttendance, loadAnalytics])

  const handleStatusChange = (studentId, status) => {
    setStudentRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    )
  }

  const handleMarkAll = (status) => {
    setStudentRecords((prev) => prev.map((r) => ({ ...r, status })))
  }

  const buildPrevious5Days = (historyRecords, currentDateStr, currentStatus, currentRemarks) => {
    const recordMap = new Map()
    if (Array.isArray(historyRecords)) {
      historyRecords.forEach((r) => {
        if (r.date) recordMap.set(r.date, r)
      })
    }

    if (currentDateStr) {
      const existingRec = recordMap.get(currentDateStr)
      recordMap.set(currentDateStr, {
        date: currentDateStr,
        status: currentStatus || existingRec?.status || "PRESENT",
        remarks: currentRemarks !== undefined && currentRemarks !== "" ? currentRemarks : (existingRec?.remarks || ""),
        recordedByName: existingRec?.recordedByName || "Current Session",
        isCurrentSession: true,
      })
    }

    const days = []
    const [y, m, d] = currentDateStr.split("-").map(Number)
    let cursor = new Date(y, m - 1, d)
    let loopCount = 0

    while (days.length < 5 && loopCount < 30) {
      loopCount++
      const dayOfWeek = cursor.getDay() // 0 = Sun, 6 = Sat
      const yStr = cursor.getFullYear()
      const mStr = String(cursor.getMonth() + 1).padStart(2, "0")
      const dStr = String(cursor.getDate()).padStart(2, "0")
      const isoStr = `${yStr}-${mStr}-${dStr}`

      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Mon - Fri only
        const rec = recordMap.get(isoStr)
        if (rec) {
          days.push({
            date: isoStr,
            dayName: cursor.toLocaleDateString("en-US", { weekday: "short" }),
            formattedDate: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: rec.status || "PRESENT",
            remarks: rec.remarks || "",
            recordedByName: rec.recordedByName || (isoStr === currentDateStr ? "Current Session" : "Staff Portal"),
            isCurrentSession: isoStr === currentDateStr,
          })
        } else {
          days.push({
            date: isoStr,
            dayName: cursor.toLocaleDateString("en-US", { weekday: "short" }),
            formattedDate: cursor.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "NOT_MARKED",
            remarks: "No session recorded",
            recordedByName: "-",
            isCurrentSession: isoStr === currentDateStr,
          })
        }
      }
      cursor.setDate(cursor.getDate() - 1)
    }

    return days
  }

  const handleOpenHistory = async (student) => {
    setSelectedStudentForHistory(student)
    setIsHistoryModalOpen(true)
    setHistoryLoading(true)
    try {
      const token = await getToken()
      const [y, m, d] = attendanceDate.split("-").map(Number)
      const pastDateObj = new Date(y, m - 1, d)
      pastDateObj.setDate(pastDateObj.getDate() - 30)
      const fromStr = `${pastDateObj.getFullYear()}-${String(pastDateObj.getMonth() + 1).padStart(2, "0")}-${String(pastDateObj.getDate()).padStart(2, "0")}`
      const toStr = attendanceDate

      const res = await fetch(
        `http://localhost:8080/api/attendance/history?studentId=${student.studentId}&from=${fromStr}&to=${toStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      const rawRecords = data.success ? data.data || [] : []

      const fiveDays = buildPrevious5Days(rawRecords, attendanceDate, student.status, student.remarks)
      setStudentHistoryRecords(fiveDays)
    } catch (err) {
      console.error("Failed to load attendance history:", err)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSaveStudentAttendance = async () => {
    if (!selectedClassId || studentRecords.length === 0) return
    try {
      setSaving(true)
      setFeedback(null)
      const token = await getToken()
      const payload = {
        classId: Number(selectedClassId),
        date: attendanceDate,
        records: studentRecords.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        })),
      }
      const res = await fetch("http://localhost:8080/api/attendance/students", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        setIsSessionRecorded(true)
        const pCount = studentRecords.filter((r) => r.status === "PRESENT").length
        const aCount = studentRecords.filter((r) => r.status === "ABSENT").length
        const lCount = studentRecords.filter((r) => r.status === "LATE").length
        const eCount = studentRecords.filter((r) => r.status === "EXCUSED").length
        setFeedback({
          type: "success",
          message: `Attendance successfully saved for ${attendanceDate}: ${pCount} Present, ${aCount} Absent${lCount > 0 ? `, ${lCount} Late` : ""}${eCount > 0 ? `, ${eCount} Excused` : ""} (${studentRecords.length} students total)!`,
        })
        await loadStudentAttendance()
      } else {
        throw new Error(data.error?.message || "Failed to save attendance")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleClearClassAttendance = async () => {
    if (!selectedClassId || !attendanceDate) return
    const selectedClass = classes.find((c) => String(c.id) === String(selectedClassId))
    const className = selectedClass ? selectedClass.name : "this class"
    if (
      !window.confirm(
        `Are you sure you want to reset/clear all attendance records for ${className} on ${attendanceDate}? This will wipe recorded attendance statuses for this session.`
      )
    ) {
      return
    }

    try {
      setSaving(true)
      setFeedback(null)
      const token = await getToken()
      const res = await fetch(
        `http://localhost:8080/api/attendance/classes/${selectedClassId}?date=${attendanceDate}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const data = await res.json()
      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || "Class attendance session cleared successfully!",
        })
        await loadStudentAttendance()
      } else {
        throw new Error(data.error?.message || "Failed to clear class attendance")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTeacherRow = async (teacherId, row) => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/attendance/teachers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacherId,
          date: attendanceDate,
          checkInTime: row.checkInTime,
          checkOutTime: row.checkOutTime,
          status: row.status,
          note: row.note,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: `Saved attendance for ${row.name}` })
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    }
  }

  // Live attendance metrics for current student sheet
  const totalCount = studentRecords.length
  const presentCount = studentRecords.filter((r) => r.status === "PRESENT").length
  const absentCount = studentRecords.filter((r) => r.status === "ABSENT").length
  const lateCount = studentRecords.filter((r) => r.status === "LATE").length
  const excusedCount = studentRecords.filter((r) => r.status === "EXCUSED").length
  const presenceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0

  // 5-Day history audit stats for the selected student
  const historyPresentCount = studentHistoryRecords.filter((d) => d.status === "PRESENT").length
  const historyAbsentCount = studentHistoryRecords.filter((d) => d.status === "ABSENT").length
  const historyLateCount = studentHistoryRecords.filter((d) => d.status === "LATE").length
  const historyExcusedCount = studentHistoryRecords.filter((d) => d.status === "EXCUSED").length
  const historyAttendanceRate = studentHistoryRecords.length > 0
    ? Math.round(((historyPresentCount + historyLateCount) / studentHistoryRecords.length) * 100)
    : 0

  let historyGrade = "Consistent Attendance (Excellent)"
  let historyGradeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  if (historyAbsentCount >= 3) {
    historyGrade = "Critical Chronic Absence - Immediate Intervention Needed"
    historyGradeClass = "bg-red-500/10 text-red-400 border-red-500/20"
  } else if (historyAbsentCount >= 1) {
    historyGrade = "Occasional Absence - Attendance Follow-Up Recommended"
    historyGradeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20"
  } else if (historyLateCount >= 2) {
    historyGrade = "Punctuality Alert - Recurrent Late Arrival"
    historyGradeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20"
  }

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
              <CalendarCheck className="h-5 w-5 text-[#3b82f6]" /> Daily Attendance Management
            </h1>
          </div>
          <p className="text-xs text-[#858687] mt-1">
            Real-time student & faculty attendance tracking, session presence verification, and analytics.
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#18191b] p-1 rounded-lg border border-white/10">
          <Button
            variant={activeSubTab === "students" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSubTab("students")}
            className="text-xs h-7 gap-1.5"
          >
            <Users className="h-3.5 w-3.5" /> Student Attendance
          </Button>
          {role !== "TEACHER" && (
            <Button
              variant={activeSubTab === "teachers" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSubTab("teachers")}
              className="text-xs h-7 gap-1.5"
            >
              <GraduationCap className="h-3.5 w-3.5" /> Faculty Attendance
            </Button>
          )}
          <Button
            variant={activeSubTab === "analytics" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSubTab("analytics")}
            className="text-xs h-7 gap-1.5"
          >
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
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

      {/* Date & Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[11px] text-[#858687] block mb-1">Session Date</label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-40 text-xs h-8"
              />
            </div>

            {activeSubTab === "students" && (
              <div>
                <label className="text-[11px] text-[#858687] block mb-1">Select Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="h-8 rounded-md border border-white/10 bg-[#131416] px-3 py-1 text-xs text-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeSubTab === "students" && studentRecords.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearClassAttendance}
                disabled={saving || loading}
                className="text-xs h-8 text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10 gap-1.5"
                title="Wipe and reset all recorded attendance for this class session"
              >
                <Trash2 className="h-3.5 w-3.5" /> Reset Session
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleMarkAll("PRESENT")} className="text-xs h-8">
                Mark All Present
              </Button>
              <Button size="sm" onClick={handleSaveStudentAttendance} disabled={saving} className="gap-1.5 text-xs h-8">
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Live Daily Attendance Status Bar */}
      {activeSubTab === "students" && studentRecords.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="p-3 bg-[#18191c] border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#858687] font-medium uppercase tracking-wider">Total Enrolled</p>
              <p className="text-xl font-bold text-white mt-0.5">{totalCount}</p>
            </div>
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </Card>

          <Card className="p-3 bg-[#18191c] border-emerald-500/20 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-emerald-400/90 font-medium uppercase tracking-wider">Present Today</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{presentCount}</p>
            </div>
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </Card>

          <Card className="p-3 bg-[#18191c] border-red-500/20 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-red-400/90 font-medium uppercase tracking-wider">Absent Today</p>
              <p className="text-xl font-bold text-red-400 mt-0.5">{absentCount}</p>
            </div>
            <div className="p-2 rounded-md bg-red-500/10 text-red-400">
              <XCircle className="w-4 h-4" />
            </div>
          </Card>

          <Card className="p-3 bg-[#18191c] border-amber-500/20 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-amber-400/90 font-medium uppercase tracking-wider">Late Today</p>
              <p className="text-xl font-bold text-amber-400 mt-0.5">{lateCount}</p>
            </div>
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </Card>

          <Card className="p-3 bg-[#18191c] border-white/5 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <p className="text-[11px] text-[#858687] font-medium uppercase tracking-wider">Presence Rate</p>
              <p className="text-xl font-bold text-white mt-0.5">{presenceRate}%</p>
            </div>
            <div className="flex flex-col items-end">
              {isSessionRecorded ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Marked
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 gap-1">
                  <Clock className="w-3 h-3" /> Unsaved
                </Badge>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* View 1: Students Attendance Sheet */}
      {activeSubTab === "students" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Admission ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-[320px]">Status Marking</TableHead>
                  <TableHead>Notes / Remarks</TableHead>
                  <TableHead className="text-right w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-[#858687] text-xs">
                      Loading class attendance records...
                    </TableCell>
                  </TableRow>
                ) : studentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-[#858687] text-xs">
                      No enrolled students found in this class.
                    </TableCell>
                  </TableRow>
                ) : (
                  studentRecords.map((r) => (
                    <TableRow
                      key={r.studentId}
                      className={
                        r.status === "ABSENT"
                          ? "bg-red-500/5 hover:bg-red-500/10 border-l-2 border-l-red-500"
                          : r.status === "LATE"
                          ? "bg-amber-500/5 hover:bg-amber-500/10 border-l-2 border-l-amber-500"
                          : "hover:bg-white/[0.02]"
                      }
                    >
                      <TableCell className="font-mono text-xs text-[#3b82f6]">{r.admissionNumber}</TableCell>
                      <TableCell className="font-medium text-white text-xs">
                        <div className="flex items-center gap-2">
                          <span>{r.fullName}</span>
                          {r.status === "ABSENT" && (
                            <Badge variant="outline" className="text-[9px] text-red-400 border-red-500/30 bg-red-500/10 py-0 px-1.5">
                              Absent
                            </Badge>
                          )}
                          {r.status === "LATE" && (
                            <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/30 bg-amber-500/10 py-0 px-1.5">
                              Late
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, "PRESENT")}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              r.status === "PRESENT"
                                ? "bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40 font-semibold"
                                : "bg-[#1f2023] text-[#858687] border border-white/5 hover:text-white"
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, "ABSENT")}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              r.status === "ABSENT"
                                ? "bg-[#ef4444]/25 text-[#ef4444] border border-[#ef4444] font-semibold"
                                : "bg-[#1f2023] text-[#858687] border border-white/5 hover:text-white"
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, "LATE")}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              r.status === "LATE"
                                ? "bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/40 font-semibold"
                                : "bg-[#1f2023] text-[#858687] border border-white/5 hover:text-white"
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.studentId, "EXCUSED")}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              r.status === "EXCUSED"
                                ? "bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40 font-semibold"
                                : "bg-[#1f2023] text-[#858687] border border-white/5 hover:text-white"
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Optional remarks..."
                          value={r.remarks}
                          onChange={(e) => {
                            const val = e.target.value
                            setStudentRecords((prev) =>
                              prev.map((rec) => (rec.studentId === r.studentId ? { ...rec, remarks: val } : rec))
                            )
                          }}
                          className="h-7 text-xs bg-transparent"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenHistory(r)}
                          className="h-7 text-xs gap-1.5 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-medium"
                          title="View previous 5-day attendance history and report"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View 2: Faculty Attendance */}
      {activeSubTab === "teachers" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-In Time</TableHead>
                  <TableHead>Check-Out Time</TableHead>
                  <TableHead>Admin Note</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-[#858687] text-xs">
                      Loading teacher attendance records...
                    </TableCell>
                  </TableRow>
                ) : teacherRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-[#858687] text-xs">
                      No teachers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  teacherRecords.map((t) => (
                    <TableRow key={t.teacherId}>
                      <TableCell className="font-medium text-white text-xs">{t.name}</TableCell>
                      <TableCell>
                        <select
                          value={t.status}
                          onChange={(e) => {
                            const val = e.target.value
                            setTeacherRecords((prev) =>
                              prev.map((row) => (row.teacherId === t.teacherId ? { ...row, status: val } : row))
                            )
                          }}
                          className="h-7 rounded border border-white/10 bg-[#131416] px-2 py-0.5 text-xs text-white"
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="LATE">LATE</option>
                          <option value="ON_LEAVE">ON LEAVE</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={t.checkInTime}
                          onChange={(e) => {
                            const val = e.target.value
                            setTeacherRecords((prev) =>
                              prev.map((row) => (row.teacherId === t.teacherId ? { ...row, checkInTime: val } : row))
                            )
                          }}
                          className="h-7 w-28 text-xs bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={t.checkOutTime}
                          onChange={(e) => {
                            const val = e.target.value
                            setTeacherRecords((prev) =>
                              prev.map((row) => (row.teacherId === t.teacherId ? { ...row, checkOutTime: val } : row))
                            )
                          }}
                          className="h-7 w-28 text-xs bg-transparent"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Note..."
                          value={t.note}
                          onChange={(e) => {
                            const val = e.target.value
                            setTeacherRecords((prev) =>
                              prev.map((row) => (row.teacherId === t.teacherId ? { ...row, note: val } : row))
                            )
                          }}
                          className="h-7 text-xs bg-transparent"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveTeacherRow(t.teacherId, t)}
                          className="h-7 text-xs px-2"
                        >
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View 3: Analytics */}
      {activeSubTab === "analytics" && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858687]">Student Attendance</span>
              <Users className="h-4 w-4 text-[#3b82f6]" />
            </div>
            <div className="text-2xl font-normal text-white mt-2">{analytics.studentAttendancePercentage}%</div>
            <div className="text-[11px] text-[#4ade80] mt-1">
              {analytics.presentStudents} of {analytics.totalStudents} students present
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858687]">Absent Students</span>
              <XCircle className="h-4 w-4 text-[#ef4444]" />
            </div>
            <div className="text-2xl font-normal text-white mt-2">{analytics.absentStudents}</div>
            <div className="text-[11px] text-[#ef4444] mt-1">
              Flagged absent on {analytics.date}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858687]">Late Arrivals</span>
              <Clock className="h-4 w-4 text-[#eab308]" />
            </div>
            <div className="text-2xl font-normal text-white mt-2">{analytics.lateStudents}</div>
            <div className="text-[11px] text-[#eab308] mt-1">
              Late recorded in morning assembly
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#858687]">Faculty Attendance</span>
              <GraduationCap className="h-4 w-4 text-[#4ade80]" />
            </div>
            <div className="text-2xl font-normal text-white mt-2">{analytics.teacherAttendancePercentage}%</div>
            <div className="text-[11px] text-[#4ade80] mt-1">
              {analytics.presentTeachers} of {analytics.totalTeachers} teachers active
            </div>
          </Card>
        </div>
      )}

      {/* 5-Day Attendance Report Modal */}
      {isHistoryModalOpen && selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131416] border border-white/10 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#18191b]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  {selectedStudentForHistory.fullName?.charAt(0) || "S"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base">
                      {selectedStudentForHistory.fullName}
                    </h3>
                    <Badge variant="outline" className="text-[11px] font-mono border-blue-500/30 text-blue-400">
                      {selectedStudentForHistory.admissionNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#858687] mt-0.5">
                    Previous 5-Day Attendance Audit Report • {classes.find((c) => String(c.id) === String(selectedClassId))?.name || "Class"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-[#858687] hover:text-white p-1.5 rounded-md hover:bg-white/5 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 overflow-y-auto">
              {historyLoading ? (
                <div className="text-center py-12 text-xs text-[#858687]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                  Loading 5-day attendance history...
                </div>
              ) : (
                <>
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[#18191c] border border-white/5">
                      <p className="text-[11px] text-[#858687] font-medium uppercase tracking-wider">Attendance Rate</p>
                      <p className="text-xl font-bold text-white mt-1">{historyAttendanceRate}%</p>
                      <p className="text-[10px] text-[#858687] mt-0.5">Last 5 school days</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#18191c] border border-emerald-500/20">
                      <p className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">Days Present</p>
                      <p className="text-xl font-bold text-emerald-400 mt-1">{historyPresentCount} / 5</p>
                      <p className="text-[10px] text-emerald-400/70 mt-0.5">Verified presence</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#18191c] border border-red-500/20">
                      <p className="text-[11px] text-red-400 font-medium uppercase tracking-wider">Days Absent</p>
                      <p className="text-xl font-bold text-red-400 mt-1">{historyAbsentCount} / 5</p>
                      <p className="text-[10px] text-red-400/70 mt-0.5">Missed sessions</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#18191c] border border-amber-500/20">
                      <p className="text-[11px] text-amber-400 font-medium uppercase tracking-wider">Late / Excused</p>
                      <p className="text-xl font-bold text-amber-400 mt-1">{historyLateCount + historyExcusedCount} / 5</p>
                      <p className="text-[10px] text-amber-400/70 mt-0.5">Punctuality flags</p>
                    </div>
                  </div>

                  {/* Assessment Alert Banner */}
                  <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${historyGradeClass}`}>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Audit Assessment:</strong> {historyGrade} ({historyPresentCount} present, {historyAbsentCount} absent over previous 5 school days).
                      </span>
                    </div>
                  </div>

                  {/* Day-by-Day Detailed 5-Day Table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        Day-by-Day 5-Day Log (Descending)
                      </h4>
                      <span className="text-[11px] text-[#858687]">Weekdays Only (Mon - Fri)</span>
                    </div>

                    <div className="border border-white/10 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#18191b]">
                            <TableHead className="text-xs">Day & Date</TableHead>
                            <TableHead className="text-xs w-[130px]">Status</TableHead>
                            <TableHead className="text-xs">Remarks / Reason</TableHead>
                            <TableHead className="text-xs text-right">Audited By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentHistoryRecords.map((day) => (
                            <TableRow key={day.date} className={day.isCurrentSession ? "bg-blue-500/5 font-medium" : ""}>
                              <TableCell className="text-xs text-white">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-blue-400">{day.dayName}</span>
                                  <span>{day.formattedDate}</span>
                                  {day.isCurrentSession && (
                                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] px-1.5 py-0">
                                      Current
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {day.status === "PRESENT" && (
                                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Present
                                  </Badge>
                                )}
                                {day.status === "ABSENT" && (
                                  <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] gap-1">
                                    <XCircle className="w-3 h-3" /> Absent
                                  </Badge>
                                )}
                                {day.status === "LATE" && (
                                  <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] gap-1">
                                    <Clock className="w-3 h-3" /> Late
                                  </Badge>
                                )}
                                {day.status === "EXCUSED" && (
                                  <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] gap-1">
                                    <AlertCircle className="w-3 h-3" /> Excused
                                  </Badge>
                                )}
                                {day.status === "NOT_MARKED" && (
                                  <Badge variant="outline" className="text-[#858687] text-[10px]">
                                    Not Recorded
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-[#858687]">
                                {day.remarks || "-"}
                              </TableCell>
                              <TableCell className="text-xs text-right text-[#858687]">
                                {day.recordedByName}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#18191b]">
              <p className="text-[11px] text-[#858687]">
                Official certified student attendance ledger record
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs h-8 gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Report
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="text-xs h-8"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
