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
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Printer,
  Receipt,
  Search,
  Wallet,
  Building,
  TrendingUp,
  X,
  Trash2,
  Edit,
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

const formatStudentClass = (st) => {
  if (!st) return ""
  if (st.className) {
    return st.className.toLowerCase().startsWith("grade")
      ? st.className
      : `Grade ${st.className}`
  }
  if (st.gradeLevel) return `Grade ${st.gradeLevel}`
  if (st.currentGrade) return `Grade ${st.currentGrade}`
  return "Grade N/A"
}

export default function FinanceLedger({ onBack }) {
  const { getToken, role, isAdmin, isPrincipal, isFinance } = useAuthUser()
  const canManageFees = isAdmin || isPrincipal || isFinance || role === "ADMIN" || role === "PRINCIPAL" || role === "FINANCE_STAFF" || role === "FINANCE"
  const [activeSubTab, setActiveSubTab] = useState("overview") // "overview" | "structures" | "record" | "outstanding"

  // Data states
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [feeStructures, setFeeStructures] = useState([])
  const [payments, setPayments] = useState([])
  const [outstanding, setOutstanding] = useState([])
  const [financialReport, setFinancialReport] = useState(null)

  // Filters & selections
  const [selectedClassId, setSelectedClassId] = useState("")
  const [searchStudent, setSearchStudent] = useState("")
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Modals
  const [isAddStructureOpen, setIsAddStructureOpen] = useState(false)
  const [isEditStructureOpen, setIsEditStructureOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  // Form states
  const [newStructure, setNewStructure] = useState({
    classId: "",
    term: "Term 1",
    academicYear: new Date().getFullYear(),
    feeType: "Tuition Fee",
    amount: "",
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split("T")[0],
  })

  const [editStructure, setEditStructure] = useState({
    id: null,
    classId: "",
    term: "Term 1",
    academicYear: new Date().getFullYear(),
    feeType: "Tuition Fee",
    amount: "",
    dueDate: "",
  })

  const [paymentForm, setPaymentForm] = useState({
    studentId: "",
    feeStructureId: "",
    amountPaid: "",
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split("T")[0],
    remarks: "",
  })

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setClasses(data.data)
        if (data.data.length > 0 && !newStructure.classId) {
          setNewStructure((prev) => ({ ...prev, classId: String(data.data[0].id) }))
        }
      }
    } catch (err) {
      console.error("Failed to load classes:", err)
    }
  }, [getToken, newStructure.classId])

  // Fetch students for payment dropdown
  const fetchStudents = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/students?size=100", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success && data.data) {
        setStudents(data.data.content || data.data)
      }
    } catch (err) {
      console.error("Failed to load students:", err)
    }
  }, [getToken])

  // Fetch fee structures
  const fetchFeeStructures = useCallback(async () => {
    try {
      const token = await getToken()
      const url = selectedClassId
        ? `http://localhost:8080/api/fees/structures?classId=${selectedClassId}`
        : "http://localhost:8080/api/fees/structures"
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setFeeStructures(data.data || [])
      }
    } catch (err) {
      console.error("Failed to load fee structures:", err)
    }
  }, [getToken, selectedClassId])

  // Fetch recent payments
  const fetchPayments = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setPayments(data.data || [])
      }
    } catch (err) {
      console.error("Failed to load payments:", err)
    }
  }, [getToken])

  // Fetch outstanding ledger
  const fetchOutstanding = useCallback(async () => {
    try {
      const token = await getToken()
      const url = selectedClassId
        ? `http://localhost:8080/api/finance/outstanding?classId=${selectedClassId}`
        : "http://localhost:8080/api/finance/outstanding"
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setOutstanding(data.data || [])
      }
    } catch (err) {
      console.error("Failed to load outstanding ledger:", err)
    }
  }, [getToken, selectedClassId])

  // Fetch Financial Report
  const fetchFinancialReport = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/finance/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setFinancialReport(data.data)
      }
    } catch (err) {
      console.error("Failed to load report:", err)
    }
  }, [getToken])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchClasses(),
      fetchStudents(),
      fetchFeeStructures(),
      fetchPayments(),
      fetchOutstanding(),
      fetchFinancialReport(),
    ])
    setLoading(false)
  }, [fetchClasses, fetchStudents, fetchFeeStructures, fetchPayments, fetchOutstanding, fetchFinancialReport])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  useEffect(() => {
    fetchFeeStructures()
    fetchOutstanding()
  }, [selectedClassId, fetchFeeStructures, fetchOutstanding])

  // Handle Add Fee Structure
  const handleCreateStructure = async (e) => {
    e.preventDefault()
    if (!newStructure.classId || !newStructure.amount) {
      setFeedback({ type: "error", message: "Class and Amount are required." })
      return
    }

    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/fees/structures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: Number(newStructure.classId),
          term: newStructure.term,
          academicYear: Number(newStructure.academicYear),
          feeType: newStructure.feeType,
          amount: parseFloat(newStructure.amount),
          dueDate: newStructure.dueDate,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: "Fee structure configured successfully!" })
        setIsAddStructureOpen(false)
        fetchFeeStructures()
        fetchFinancialReport()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to configure fee structure." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Network error configuring fee structure." })
    }
  }

  // Handle Open Edit Fee Structure Modal
  const handleOpenEditStructure = (fs) => {
    setEditStructure({
      id: fs.id,
      classId: fs.classId ? String(fs.classId) : "",
      term: fs.term || "Term 1",
      academicYear: fs.academicYear || new Date().getFullYear(),
      feeType: fs.feeType || "Tuition Fee",
      amount: fs.amount != null ? String(fs.amount) : "",
      dueDate: fs.dueDate ? String(fs.dueDate) : "",
    })
    setIsEditStructureOpen(true)
  }

  // Handle Update Fee Structure
  const handleUpdateStructure = async (e) => {
    e.preventDefault()
    if (!editStructure.id || !editStructure.classId || !editStructure.amount) {
      setFeedback({ type: "error", message: "Class and Amount are required." })
      return
    }

    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/fees/structures/${editStructure.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: Number(editStructure.classId),
          term: editStructure.term,
          academicYear: Number(editStructure.academicYear),
          feeType: editStructure.feeType,
          amount: parseFloat(editStructure.amount),
          dueDate: editStructure.dueDate || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: "Fee structure updated successfully!" })
        setIsEditStructureOpen(false)
        fetchFeeStructures()
        fetchFinancialReport()
        fetchOutstanding()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to update fee structure." })
      }
    } catch (err) {
      console.error("Failed to update fee structure:", err)
      setFeedback({ type: "error", message: "Network error updating fee structure." })
    }
  }

  // Handle Delete Fee Structure
  const handleDeleteStructure = async (id, feeType, className) => {
    const label = feeType ? `"${feeType}"${className ? ` for ${className}` : ""}` : "this fee structure"
    if (!window.confirm(`Are you sure you want to delete ${label}? This will permanently remove the fee schedule and any associated records.`)) {
      return
    }

    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/fees/structures/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: data.message || "Fee structure deleted successfully!" })
        fetchFeeStructures()
        fetchOutstanding()
        fetchFinancialReport()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to delete fee structure." })
      }
    } catch (err) {
      console.error("Failed to delete fee structure:", err)
      setFeedback({ type: "error", message: "Network error deleting fee structure." })
    }
  }

  // Handle Record Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault()
    if (!paymentForm.studentId || !paymentForm.feeStructureId || !paymentForm.amountPaid) {
      setFeedback({ type: "error", message: "Student, Fee Structure, and Amount Paid are required." })
      return
    }

    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: Number(paymentForm.studentId),
          feeStructureId: Number(paymentForm.feeStructureId),
          amountPaid: parseFloat(paymentForm.amountPaid),
          paymentDate: paymentForm.paymentDate,
          paymentMethod: paymentForm.paymentMethod,
          remarks: paymentForm.remarks,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: `Payment accepted! Receipt #${data.data.receiptNumber}` })
        setSelectedReceipt(data.data)
        setPaymentForm({
          studentId: "",
          feeStructureId: "",
          amountPaid: "",
          paymentMethod: "CASH",
          paymentDate: new Date().toISOString().split("T")[0],
          remarks: "",
        })
        fetchPayments()
        fetchOutstanding()
        fetchFinancialReport()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to record payment." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error submitting payment." })
    }
  }

  // Filter outstanding list by search
  const filteredOutstanding = outstanding.filter((item) => {
    const query = searchStudent.toLowerCase()
    return (
      item.studentName?.toLowerCase().includes(query) ||
      item.admissionNumber?.toLowerCase().includes(query) ||
      item.className?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Finance & Fee Ledger</h1>
              <p className="text-sm text-muted-foreground">
                Configure fee structures, process student payments, issue receipts, and track collection rates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="outline" onClick={onBack} size="sm">
              Back to Dashboard
            </Button>
          )}
          <Button variant="outline" onClick={refreshAll} disabled={loading} size="sm" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {canManageFees && (
            <Button onClick={() => setIsAddStructureOpen(true)} size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4" />
              Configure Fee
            </Button>
          )}
        </div>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type === "error" ? "destructive" : "default"}
          className={feedback.type === "success" ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" : ""}
        >
          {feedback.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <AlertTitle>{feedback.type === "error" ? "Action Failed" : "Success"}</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{feedback.message}</span>
            <Button variant="ghost" size="sm" onClick={() => setFeedback(null)} className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === "overview"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Financial Summary
        </button>
        <button
          onClick={() => setActiveSubTab("structures")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === "structures"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Building className="w-4 h-4" />
          Fee Structures ({feeStructures.length})
        </button>
        <button
          onClick={() => setActiveSubTab("record")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === "record"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Process Payment
        </button>
        <button
          onClick={() => setActiveSubTab("outstanding")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSubTab === "outstanding"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Wallet className="w-4 h-4" />
          Outstanding Balances ({outstanding.length})
        </button>
      </div>

      {/* SUBTAB 1: FINANCIAL OVERVIEW */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Expected</p>
                    <p className="text-2xl font-bold mt-1 text-foreground">
                      Rs. {
                        (financialReport?.totalExpectedRevenue != null || (financialReport?.totalCollected != null && financialReport?.totalOutstanding != null))
                          ? Number(financialReport?.totalExpectedRevenue ?? (financialReport.totalCollected + financialReport.totalOutstanding)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : "0.00"
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Collected</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-500">
                      Rs. {
                        (financialReport?.totalCollectedRevenue != null || financialReport?.totalCollected != null)
                          ? Number(financialReport?.totalCollectedRevenue ?? financialReport.totalCollected).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : "0.00"
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Outstanding Dues</p>
                    <p className="text-2xl font-bold mt-1 text-amber-500">
                      Rs. {
                        (financialReport?.totalOutstandingDues != null || financialReport?.totalOutstanding != null)
                          ? Number(financialReport?.totalOutstandingDues ?? financialReport.totalOutstanding).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : "0.00"
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Collection Rate</p>
                    <p className="text-2xl font-bold mt-1 text-foreground">
                      {
                        financialReport?.collectionRatePercentage != null
                          ? `${Number(financialReport.collectionRatePercentage).toFixed(1)}%`
                          : (financialReport?.totalCollected != null && (financialReport.totalCollected + (financialReport.totalOutstanding || 0)) > 0
                              ? `${((financialReport.totalCollected / (financialReport.totalCollected + (financialReport.totalOutstanding || 0))) * 100).toFixed(1)}%`
                              : "0%")
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payments Table */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Payment Transactions</CardTitle>
                <CardDescription>Audited real-time ledger of recorded payments and printed receipts</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSubTab("record")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Record New Payment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No payments recorded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.slice(0, 15).map((pay) => (
                        <TableRow key={pay.id || pay.receiptNumber} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs font-semibold text-emerald-500">
                            {pay.receiptNumber}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {pay.studentName}
                            <span className="block text-xs text-muted-foreground">{pay.admissionNumber}</span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {pay.className ? (pay.className.toLowerCase().startsWith("grade") ? pay.className : `Grade ${pay.className}`) : "Grade N/A"}
                          </TableCell>
                          <TableCell className="text-xs">{pay.feeType}</TableCell>
                          <TableCell className="font-semibold text-emerald-400">
                            Rs. {pay.amountPaid != null ? Number(pay.amountPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{pay.paymentDate}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {pay.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedReceipt(pay)}
                              className="gap-1 h-7 text-xs text-emerald-400 hover:text-emerald-300"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUBTAB 2: FEE STRUCTURES */}
      {activeSubTab === "structures" && (
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Class Fee Structures</CardTitle>
              <CardDescription>Academic year schedules, term charges, and fee amounts</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {formatClassName(cls)}
                  </option>
                ))}
              </select>
              {canManageFees && (
                <Button
                  onClick={() => setIsAddStructureOpen(true)}
                  size="sm"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Add Structure
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Class</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    {canManageFees && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canManageFees ? 7 : 6} className="text-center py-8 text-muted-foreground">
                        No fee structures defined for this criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    feeStructures.map((fs) => (
                      <TableRow key={fs.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-foreground">{fs.className}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{fs.term}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{fs.academicYear}</TableCell>
                        <TableCell className="font-medium text-foreground">{fs.feeType}</TableCell>
                        <TableCell className="font-bold text-emerald-400">Rs. {fs.amount?.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fs.dueDate || "N/A"}</TableCell>
                        {canManageFees && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditStructure(fs)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8 px-2.5 gap-1.5 text-xs font-medium"
                                title="Edit Fee Structure"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStructure(fs.id, fs.feeType, fs.className)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2.5 gap-1.5 text-xs font-medium"
                                title="Delete Fee Structure"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </Button>
                            </div>
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

      {/* SUBTAB 3: RECORD PAYMENT */}
      {activeSubTab === "record" && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                Record Student Payment
              </CardTitle>
              <CardDescription>
                Accept cash, bank transfer, or cheque payments and automatically generate an official stamped receipt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Select Student *</label>
                  <select
                    value={paymentForm.studentId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName || `${st.firstName} ${st.lastName || ""}`.trim()} ({st.admissionNumber}) - {formatStudentClass(st)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Fee Structure Schedule *</label>
                  <select
                    value={paymentForm.feeStructureId}
                    onChange={(e) => {
                      const struct = feeStructures.find((f) => String(f.id) === e.target.value)
                      setPaymentForm({
                        ...paymentForm,
                        feeStructureId: e.target.value,
                        amountPaid: struct ? String(struct.amount) : paymentForm.amountPaid,
                      })
                    }}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    <option value="">-- Choose Applicable Fee --</option>
                    {feeStructures.map((fs) => (
                      <option key={fs.id} value={fs.id}>
                        {fs.className} | {fs.feeType} ({fs.term}, {fs.academicYear}) - Rs. {fs.amount}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Amount Paid (Rs.) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="e.g. 5000.00"
                      value={paymentForm.amountPaid}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Payment Date</label>
                    <Input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Payment Method *</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    <option value="CASH">Cash Deposit</option>
                    <option value="BANK_TRANSFER">Bank Direct Transfer</option>
                    <option value="CHEQUE">Bank Cheque</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Payment Notes / Reference No.</label>
                  <Input
                    placeholder="e.g. Bank Ref #TX89201, parent paid in front desk"
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5"
                  >
                    Confirm & Generate Receipt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUBTAB 4: OUTSTANDING LEDGER */}
      {activeSubTab === "outstanding" && (
        <Card className="border-border">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Outstanding Fee Ledger</CardTitle>
              <CardDescription>
                Detailed audit of dues, actual payments collected, and outstanding balances per student
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter student..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="pl-9 h-9 w-[180px] md:w-[220px]"
                />
              </div>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {formatClassName(cls)}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOutstanding.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No outstanding balances recorded.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOutstanding.map((item) => (
                      <TableRow key={item.studentId} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-foreground">{item.studentName}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.admissionNumber}
                        </TableCell>
                        <TableCell className="text-xs">{item.className}</TableCell>
                        <TableCell className="text-sm font-semibold">Rs. {item.totalDue?.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-emerald-400 font-semibold">
                          Rs. {item.totalPaid?.toLocaleString()}
                        </TableCell>
                        <TableCell
                          className={`text-sm font-bold ${
                            item.balance > 0 ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          Rs. {item.balance?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "PAID"
                                ? "default"
                                : item.status === "PARTIAL"
                                ? "outline"
                                : "destructive"
                            }
                            className={
                              item.status === "PAID"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : item.status === "PARTIAL"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : ""
                            }
                          >
                            {item.status}
                          </Badge>
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

      {/* MODAL 1: ADD FEE STRUCTURE */}
      {isAddStructureOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-500" />
                Configure Fee Structure
              </h2>
              <button
                onClick={() => setIsAddStructureOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Class / Grade *</label>
                <select
                  value={newStructure.classId}
                  onChange={(e) => setNewStructure({ ...newStructure, classId: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatClassName(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Term *</label>
                  <select
                    value={newStructure.term}
                    onChange={(e) => setNewStructure({ ...newStructure, term: e.target.value })}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Academic Year *</label>
                  <Input
                    type="number"
                    value={newStructure.academicYear}
                    onChange={(e) => setNewStructure({ ...newStructure, academicYear: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Fee Category / Type *</label>
                <select
                  value={newStructure.feeType}
                  onChange={(e) => setNewStructure({ ...newStructure, feeType: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="Tuition & Facility Fee">Tuition & Facility Fee</option>
                  <option value="Science Laboratory Fee">Science Laboratory Fee</option>
                  <option value="Facility Fee">Facility Fee</option>
                  <option value="Sports & Activity Fee">Sports & Activity Fee</option>
                  <option value="Library Fee">Library Fee</option>
                  <option value="Examination Fee">Examination Fee</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Amount (Rs.) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="25000.00"
                    value={newStructure.amount}
                    onChange={(e) => setNewStructure({ ...newStructure, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date</label>
                  <Input
                    type="date"
                    value={newStructure.dueDate}
                    onChange={(e) => setNewStructure({ ...newStructure, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsAddStructureOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save Fee Structure
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FEE STRUCTURE */}
      {isEditStructureOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-500" />
                Edit Fee Structure
              </h2>
              <button
                onClick={() => setIsEditStructureOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStructure} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Class / Grade *</label>
                <select
                  value={editStructure.classId}
                  onChange={(e) => setEditStructure({ ...editStructure, classId: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatClassName(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Term *</label>
                  <select
                    value={editStructure.term}
                    onChange={(e) => setEditStructure({ ...editStructure, term: e.target.value })}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Academic Year *</label>
                  <Input
                    type="number"
                    value={editStructure.academicYear}
                    onChange={(e) => setEditStructure({ ...editStructure, academicYear: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Fee Category / Type *</label>
                <select
                  value={editStructure.feeType}
                  onChange={(e) => setEditStructure({ ...editStructure, feeType: e.target.value })}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  {editStructure.feeType && ![
                    "Tuition Fee",
                    "Tuition & Facility Fee",
                    "Science Laboratory Fee",
                    "Facility Fee",
                    "Sports & Activity Fee",
                    "Library Fee",
                    "Examination Fee"
                  ].includes(editStructure.feeType) && (
                    <option value={editStructure.feeType}>{editStructure.feeType}</option>
                  )}
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="Tuition & Facility Fee">Tuition & Facility Fee</option>
                  <option value="Science Laboratory Fee">Science Laboratory Fee</option>
                  <option value="Facility Fee">Facility Fee</option>
                  <option value="Sports & Activity Fee">Sports & Activity Fee</option>
                  <option value="Library Fee">Library Fee</option>
                  <option value="Examination Fee">Examination Fee</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Amount (Rs.) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="25000.00"
                    value={editStructure.amount}
                    onChange={(e) => setEditStructure({ ...editStructure, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date</label>
                  <Input
                    type="date"
                    value={editStructure.dueDate}
                    onChange={(e) => setEditStructure({ ...editStructure, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsEditStructureOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Update Fee Structure
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE RECEIPT */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-foreground">Official Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Body */}
            <div id="payment-receipt" className="border border-border/80 bg-background/50 rounded-lg p-5 space-y-4">
              <div className="text-center border-b border-dashed border-border pb-4">
                <h2 className="text-xl font-bold tracking-tight text-foreground">SCHOOL INFORMATION SYSTEM</h2>
                <p className="text-xs text-muted-foreground">Certified Academic & Financial Management</p>
                <div className="mt-2 inline-block bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-mono font-semibold">
                  Receipt #{selectedReceipt.receiptNumber}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Student Name:</span>
                  <span className="font-bold text-foreground text-sm">{selectedReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Admission Number:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedReceipt.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Class:</span>
                  <span className="font-medium text-foreground">{selectedReceipt.className}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Payment Date:</span>
                  <span className="font-medium text-foreground">{selectedReceipt.paymentDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Fee Item:</span>
                  <span className="font-medium text-foreground">{selectedReceipt.feeType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Payment Method:</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {selectedReceipt.paymentMethod}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-b border-border py-3 flex items-center justify-between bg-muted/20 px-3 rounded">
                <span className="font-semibold text-foreground">Total Paid:</span>
                <span className="text-xl font-bold text-emerald-400">
                  Rs. {selectedReceipt.amountPaid?.toLocaleString()}
                </span>
              </div>

              <div className="text-[10px] text-muted-foreground flex justify-between pt-2">
                <span>Recorded By: {selectedReceipt.recordedByName || "Cashier Staff"}</span>
                <span>System Verified: YES</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Voucher
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
