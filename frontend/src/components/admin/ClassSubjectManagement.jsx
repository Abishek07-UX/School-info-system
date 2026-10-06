import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { academicService } from "@/services/academicService"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Building2,
  BookOpen,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  GraduationCap,
  X,
  Users,
  ArrowRightLeft,
  School,
  ChevronRight,
  Hash,
  UserCheck,
} from "lucide-react"

export default function ClassSubjectManagement() {
  const { getToken, role } = useAuthUser()
  const canManage = role === "ADMIN" || role === "PRINCIPAL"

  const [activeTab, setActiveTab] = useState("sections") // "sections" | "classes" | "subjects"

  const [sections, setSections] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Filters
  const [gradeFilter, setGradeFilter] = useState("all")
  const [classSearch, setClassSearch] = useState("")

  // Modals
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false)
  const [isAddClassOpen, setIsAddClassOpen] = useState(false)
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
  const [reassignClass, setReassignClass] = useState(null) // class object to reassign
  const [selectedNewSectionId, setSelectedNewSectionId] = useState("")

  // Forms
  const [newSection, setNewSection] = useState({ name: "Grade 10", gradeLevel: "10" })
  const [newClass, setNewClass] = useState({
    name: "",
    gradeLevel: "10",
    capacity: 50,
    sectionId: "",
    classTeacherId: "",
  })
  const [newSubject, setNewSubject] = useState({ name: "", code: "", gradeLevel: "10" })

  const fetchSections = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/sections", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data)
      } else {
        console.warn("Sections API returned:", data)
      }
    } catch (err) {
      console.error("Failed to load sections:", err)
    }
  }, [getToken])

  const fetchClasses = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setClasses(data.data)
      } else {
        // Fallback to academic lookup
        const lookup = await academicService.getClasses(getToken)
        if (Array.isArray(lookup)) {
          setClasses(lookup)
        }
      }
    } catch (err) {
      console.error("Failed to load classes, trying fallback:", err)
      try {
        const lookup = await academicService.getClasses(getToken)
        if (Array.isArray(lookup)) {
          setClasses(lookup)
        }
      } catch (e) {
        console.error("Fallback class lookup failed:", e)
      }
    }
  }, [getToken])

  const fetchSubjects = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setSubjects(data.data || [])
      } else {
        const lookup = await academicService.getAllSubjects(getToken)
        if (Array.isArray(lookup)) setSubjects(lookup)
      }
    } catch (err) {
      console.error("Failed to load subjects:", err)
      try {
        const lookup = await academicService.getAllSubjects(getToken)
        if (Array.isArray(lookup)) setSubjects(lookup)
      } catch (e) {
        console.error("Fallback subjects lookup failed:", e)
      }
    }
  }, [getToken])

  const fetchTeachers = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setTeachers(data.data)
      } else {
        const resLookup = await fetch("http://localhost:8080/api/academic/lookup/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const dataLookup = await resLookup.json()
        if (dataLookup.success) setTeachers(dataLookup.data || [])
      }
    } catch (err) {
      console.error("Failed to load teachers:", err)
      try {
        const token = await getToken()
        const resLookup = await fetch("http://localhost:8080/api/academic/lookup/teachers", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const dataLookup = await resLookup.json()
        if (dataLookup.success) setTeachers(dataLookup.data || [])
      } catch (e) {}
    }
  }, [getToken])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchSections(), fetchClasses(), fetchSubjects(), fetchTeachers()])
    setLoading(false)
  }, [fetchSections, fetchClasses, fetchSubjects, fetchTeachers])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  // Handle Create Section (e.g. "Grade 10")
  const handleCreateSection = async (e) => {
    e.preventDefault()
    if (!newSection.name || !newSection.gradeLevel) return

    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSection.name.trim(),
          gradeLevel: Number(newSection.gradeLevel),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({
          type: "success",
          message: `Section "${data.data.name}" (Grade ${data.data.gradeLevel}) created successfully! Classes added to this section will contribute to its total capacity.`,
        })
        setIsAddSectionOpen(false)
        setNewSection({ name: "Grade 10", gradeLevel: "10" })
        refreshAll()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to create section." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error creating section." })
    }
  }

  // Handle Create Class (e.g. "Grade 10-A", capacity: 50, belongs to "Grade 10" Section)
  const handleCreateClass = async (e) => {
    e.preventDefault()
    if (!newClass.name || !newClass.gradeLevel) return

    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newClass.name.trim(),
          gradeLevel: Number(newClass.gradeLevel),
          capacity: Number(newClass.capacity || 50),
          sectionId: newClass.sectionId ? Number(newClass.sectionId) : null,
          classTeacherId: newClass.classTeacherId ? Number(newClass.classTeacherId) : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({
          type: "success",
          message: `Class "${data.data.name}" created with capacity ${data.data.capacity} students! It has been linked to section "${data.data.sectionName || "Grade " + data.data.gradeLevel}".`,
        })
        setIsAddClassOpen(false)
        setNewClass({
          name: "",
          gradeLevel: "10",
          capacity: 50,
          sectionId: "",
          classTeacherId: "",
        })
        refreshAll()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to create class." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error creating class." })
    }
  }

  // Handle Reassign Class Section
  const handleReassignSection = async (e) => {
    e.preventDefault()
    if (!reassignClass || !selectedNewSectionId) return

    try {
      const token = await getToken()
      const res = await fetch(
        `http://localhost:8080/api/classes/${reassignClass.id}/section/${selectedNewSectionId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await res.json()
      if (data.success) {
        setFeedback({
          type: "success",
          message: `Class "${reassignClass.name}" successfully reassigned to Section "${data.data.sectionName}".`,
        })
        setReassignClass(null)
        setSelectedNewSectionId("")
        refreshAll()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to reassign class section." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error reassigning section." })
    }
  }

  // Handle Create Subject
  const handleCreateSubject = async (e) => {
    e.preventDefault()
    if (!newSubject.name || !newSubject.code || !newSubject.gradeLevel) return

    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSubject.name.trim(),
          code: newSubject.code.toUpperCase().trim(),
          gradeLevel: Number(newSubject.gradeLevel),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: `Subject "${data.data.name}" (${data.data.code}) registered!` })
        setIsAddSubjectOpen(false)
        setNewSubject({ name: "", code: "", gradeLevel: "10" })
        fetchSubjects()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to register subject." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error registering subject." })
    }
  }

  // When opening Create Class modal from a specific Section card
  const openAddClassForSection = (sec) => {
    setNewClass({
      name: `Grade ${sec.gradeLevel || sec.grade}-`,
      gradeLevel: String(sec.gradeLevel || sec.grade || "10"),
      capacity: 50,
      sectionId: String(sec.id),
      classTeacherId: "",
    })
    setIsAddClassOpen(true)
  }

  // Filtered sections
  const filteredSections = useMemo(() => {
    if (gradeFilter === "all") return sections
    return sections.filter((s) => String(s.gradeLevel || s.grade) === gradeFilter)
  }, [sections, gradeFilter])

  // Filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesGrade = gradeFilter === "all" || String(c.gradeLevel || c.grade) === gradeFilter
      const matchesSearch =
        !classSearch ||
        c.name.toLowerCase().includes(classSearch.toLowerCase()) ||
        (c.sectionName && c.sectionName.toLowerCase().includes(classSearch.toLowerCase()))
      return matchesGrade && matchesSearch
    })
  }, [classes, gradeFilter, classSearch])

  // Aggregated totals
  const totalCapacityAllSections = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.totalCapacity || 0), 0)
  }, [sections])

  const totalStudentsAllSections = useMemo(() => {
    return sections.reduce((acc, s) => acc + (s.totalStudents || 0), 0)
  }, [sections])

  return (
    <div className="space-y-6">
      {feedback && (
        <Alert
          variant={feedback.type === "error" ? "destructive" : "default"}
          className={
            feedback.type === "success"
              ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
              : ""
          }
        >
          {feedback.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <AlertTitle>{feedback.type === "error" ? "Action Failed" : "Success"}</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{feedback.message}</span>
            <Button variant="ghost" size="sm" onClick={() => setFeedback(null)} className="h-6 w-6 p-0 hover:bg-transparent">
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Grade Sections</p>
              <h4 className="text-xl font-bold text-foreground">{sections.length}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Classes</p>
              <h4 className="text-xl font-bold text-foreground">{classes.length}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Aggregated Capacity</p>
              <h4 className="text-xl font-bold text-emerald-500">{totalCapacityAllSections} Seats</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Enrolled Students</p>
              <h4 className="text-xl font-bold text-foreground">{totalStudentsAllSections} Students</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "sections"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            Grade Sections & Cohorts ({sections.length})
          </button>

          <button
            onClick={() => setActiveTab("classes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "classes"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Building2 className="w-4 h-4" />
            All Classes ({classes.length})
          </button>

          <button
            onClick={() => setActiveTab("subjects")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "subjects"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Curriculum Subjects ({subjects.length})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {canManage && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewSection({ name: "Grade 10", gradeLevel: "10" })
                  setIsAddSectionOpen(true)
                }}
                className="gap-1 border-primary/40 text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setNewClass({
                    name: "Grade 10-A",
                    gradeLevel: "10",
                    capacity: 50,
                    sectionId: sections.length > 0 ? String(sections[0].id) : "",
                    classTeacherId: "",
                  })
                  setIsAddClassOpen(true)
                }}
                className="gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Class
              </Button>
            </>
          )}

          {canManage && activeTab === "subjects" && (
            <Button size="sm" onClick={() => setIsAddSubjectOpen(true)} className="gap-1">
              <Plus className="w-4 h-4" />
              Add Subject
            </Button>
          )}
        </div>
      </div>

      {/* FILTER BAR FOR SECTIONS / CLASSES */}
      {activeTab !== "subjects" && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/40">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground mr-1">Grade Filter:</span>
            {["all", "7", "8", "9", "10", "11", "12"].map((g) => (
              <Button
                key={g}
                variant={gradeFilter === g ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={() => setGradeFilter(g)}
              >
                {g === "all" ? "All Grades" : `Grade ${g}`}
              </Button>
            ))}
          </div>

          {activeTab === "classes" && (
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search class or section..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 1: GRADE SECTIONS & COHORTS */}
      {activeTab === "sections" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Grade Cohort Sections</h3>
              <p className="text-xs text-muted-foreground">
                Each Grade Section aggregates all its classes. Individual class capacities (e.g. 50 students each) automatically sum into the Section Total Capacity.
              </p>
            </div>
          </div>

          {filteredSections.length === 0 ? (
            <Card className="border-border p-12 text-center">
              <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h4 className="text-sm font-medium text-foreground">No sections configured</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Create a section (e.g. "Grade 10") to group classes like Grade 10-A, 10-B, and 10-C.
              </p>
              {canManage && (
                <Button
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => setIsAddSectionOpen(true)}
                >
                  <Plus className="w-4 h-4" /> Create Section
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredSections.map((sec) => {
                const secClasses = sec.classes || []
                const totalCap = sec.totalCapacity || 0
                const totalStu = sec.totalStudents || 0
                const percent = totalCap > 0 ? Math.min(100, Math.round((totalStu / totalCap) * 100)) : 0

                return (
                  <Card key={sec.id} className="border-border hover:border-primary/40 transition-colors shadow-sm overflow-hidden">
                    {/* Section Header Card */}
                    <div className="p-4 sm:p-5 bg-muted/20 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg font-bold text-foreground">{sec.name}</h4>
                            <Badge variant="secondary" className="text-xs font-semibold">
                              Grade {sec.gradeLevel || sec.grade}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {secClasses.length} {secClasses.length === 1 ? "Class" : "Classes"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Cohorts: {secClasses.map((c) => c.name).join(", ") || "No classes assigned yet"}
                          </p>
                        </div>
                      </div>

                      {/* Section Metrics: Total Capacity and Enrolled */}
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-xs text-muted-foreground">Section Total Capacity:</span>
                            <span className="text-base font-bold text-emerald-500 font-mono">
                              {totalCap} Seats
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Enrolled: <span className="font-semibold text-foreground">{totalStu}</span> students ({percent}% full)
                          </div>
                          <div className="w-36 mt-1.5 ml-auto">
                            <Progress value={percent} className="h-1.5" />
                          </div>
                        </div>

                        {canManage && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAddClassForSection(sec)}
                            className="gap-1 shrink-0 text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Class
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Classes belonging to this Section */}
                    <div className="p-0 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/10 text-xs">
                            <TableHead className="w-1/4">Class Name</TableHead>
                            <TableHead className="w-1/5">Capacity Limit</TableHead>
                            <TableHead className="w-1/5">Enrolled Students</TableHead>
                            <TableHead className="w-1/4">Class Teacher</TableHead>
                            {canManage && <TableHead className="w-24 text-right">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {secClasses.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={canManage ? 5 : 4} className="text-center py-6 text-xs text-muted-foreground">
                                No classes in this section yet. Click "+ Add Class" to assign classes (e.g. Grade 10-A, Grade 10-B) to this section.
                              </TableCell>
                            </TableRow>
                          ) : (
                            secClasses.map((cls) => (
                              <TableRow key={cls.id} className="hover:bg-muted/30 text-xs">
                                <TableCell className="font-semibold text-foreground flex items-center gap-2">
                                  <School className="w-3.5 h-3.5 text-primary opacity-70" />
                                  {cls.name}
                                </TableCell>
                                <TableCell>
                                  <span className="font-mono font-medium text-foreground bg-accent/40 px-2 py-0.5 rounded">
                                    {cls.capacity || 50} students
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-muted-foreground">
                                    {cls.studentCount || 0} students
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {cls.classTeacherName ? (
                                    <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                                      {cls.classTeacherName}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground italic">Unassigned</span>
                                  )}
                                </TableCell>
                                {canManage && (
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        setReassignClass(cls)
                                        setSelectedNewSectionId(String(sec.id))
                                      }}
                                    >
                                      <ArrowRightLeft className="w-3 h-3" />
                                      Move
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          )}
                          {/* Aggregated Totals Row */}
                          {secClasses.length > 0 && (
                            <TableRow className="bg-muted/30 font-semibold border-t-2 border-border">
                              <TableCell className="text-foreground">
                                Section Total ({sec.name})
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-emerald-500 text-xs font-bold">
                                  {totalCap} total seats
                                </span>
                              </TableCell>
                              <TableCell className="text-foreground text-xs">
                                {totalStu} total students
                              </TableCell>
                              <TableCell colSpan={canManage ? 2 : 1} className="text-xs text-muted-foreground">
                                Across {secClasses.length} classes
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL CLASSES DIRECTORY */}
      {activeTab === "classes" && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">School Classes Directory</CardTitle>
            <CardDescription>
              All configured school classes with their assigned Grade Sections and capacities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade Section / Cohort</TableHead>
                    <TableHead>Grade Level</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Enrolled Students</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    {canManage && <TableHead className="text-right">Section Link</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManage ? 7 : 6} className="text-center py-8 text-muted-foreground">
                        No school classes match the filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClasses.map((cls) => (
                      <TableRow key={cls.id} className="hover:bg-muted/30 text-xs">
                        <TableCell className="font-semibold text-foreground">{cls.name}</TableCell>
                        <TableCell>
                          {cls.sectionName ? (
                            <Badge variant="secondary" className="gap-1 font-medium">
                              <Layers className="w-3 h-3 text-primary" />
                              {cls.sectionName}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Standalone
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Grade {cls.gradeLevel || cls.grade}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {cls.capacity || 50} students
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {cls.studentCount || 0} students
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {cls.classTeacherName || <span className="text-muted-foreground italic text-xs">Unassigned</span>}
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setReassignClass(cls)
                                setSelectedNewSectionId(cls.sectionId ? String(cls.sectionId) : "")
                              }}
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              Change Section
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: SUBJECTS */}
      {activeTab === "subjects" && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Curriculum Subjects</CardTitle>
            <CardDescription>Official curriculum course codes and assigned grade levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Title</TableHead>
                    <TableHead>Grade Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No subjects registered yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subjects.map((sb) => (
                      <TableRow key={sb.id} className="hover:bg-muted/30 text-xs">
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          {sb.code}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{sb.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Grade {sb.gradeLevel}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: ADD SECTION */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Create Grade Section
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  e.g. Create "Grade 10" Section to group Grade 10-A, 10-B, 10-C classes.
                </p>
              </div>
              <button onClick={() => setIsAddSectionOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Section Name *</label>
                <Input
                  placeholder="e.g. Grade 10 or Grade 10 - Stream A"
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Grade Level (1–13) *</label>
                <Input
                  type="number"
                  min="1"
                  max="13"
                  value={newSection.gradeLevel}
                  onChange={(e) => {
                    const gl = e.target.value
                    setNewSection({
                      name: `Grade ${gl}`,
                      gradeLevel: gl,
                    })
                  }}
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                💡 <strong>Section Aggregation Logic:</strong> Once this section is created, any class assigned to it (e.g. Grade 10-A with 50 students, Grade 10-B with 50 students) will aggregate into this section's total student capacity (e.g. 150 students).
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddSectionOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Section</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CLASS */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Create School Class
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  e.g. Add Grade 10-A to the Grade 10 Section with 50 students capacity.
                </p>
              </div>
              <button onClick={() => setIsAddClassOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Belongs to Section *</label>
                <select
                  value={newClass.sectionId}
                  onChange={(e) => {
                    const secId = e.target.value
                    const foundSec = sections.find((s) => String(s.id) === secId)
                    setNewClass((prev) => ({
                      ...prev,
                      sectionId: secId,
                      gradeLevel: foundSec ? String(foundSec.gradeLevel || foundSec.grade) : prev.gradeLevel,
                      name: foundSec && !prev.name ? `${foundSec.name}-A` : prev.name,
                    }))
                  }}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Auto-link or Select Section --</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Grade {s.gradeLevel || s.grade})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  The class will belong to this section and add to its total capacity.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Class Name *</label>
                <Input
                  placeholder="e.g. Grade 10-A or Grade 10-B"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Grade Level *</label>
                  <Input
                    type="number"
                    min="1"
                    max="13"
                    value={newClass.gradeLevel}
                    onChange={(e) => setNewClass({ ...newClass, gradeLevel: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Capacity (e.g. 50)</label>
                  <Input
                    type="number"
                    min="1"
                    max="150"
                    value={newClass.capacity}
                    onChange={(e) => setNewClass({ ...newClass, capacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Class Teacher (Optional)</label>
                <select
                  value={newClass.classTeacherId}
                  onChange={(e) => setNewClass({ ...newClass, classTeacherId: e.target.value })}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- No Class Teacher Assigned --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.fullName} ({t.employeeId || t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddClassOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Class</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REASSIGN CLASS SECTION */}
      {reassignClass && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                Change Class Section
              </h3>
              <button onClick={() => setReassignClass(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSection} className="space-y-4">
              <div className="p-3 rounded-lg bg-accent/40 border border-border space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">Class:</span>{" "}
                  <strong className="text-foreground">{reassignClass.name}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span>{" "}
                  <strong className="text-emerald-500 font-mono">{reassignClass.capacity || 50} students</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Assign to New Section *</label>
                <select
                  value={selectedNewSectionId}
                  onChange={(e) => setSelectedNewSectionId(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  <option value="">-- Choose Target Section --</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Grade {s.gradeLevel || s.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setReassignClass(null)}>
                  Cancel
                </Button>
                <Button type="submit">Confirm Reassignment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD SUBJECT */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Register Curriculum Subject
              </h3>
              <button onClick={() => setIsAddSubjectOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Subject Name *</label>
                <Input
                  placeholder="e.g. Mathematics, Physical Science, English"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Subject Code *</label>
                  <Input
                    placeholder="e.g. MAT101"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Grade Level *</label>
                  <Input
                    type="number"
                    min="1"
                    max="13"
                    value={newSubject.gradeLevel}
                    onChange={(e) => setNewSubject({ ...newSubject, gradeLevel: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddSubjectOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Subject</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
