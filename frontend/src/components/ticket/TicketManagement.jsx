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
  Ticket,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserCheck,
  CheckCheck,
  MessageSquare,
  Search,
  Filter,
  X,
  ShieldAlert,
  Trash2,
  Edit2,
} from "lucide-react"

export default function TicketManagement({ onBack }) {
  const { getToken, role, user } = useAuthUser()
  const [tickets, setTickets] = useState([])
  const [staffUsers, setStaffUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Multi-select state
  const [selectedTicketIds, setSelectedTicketIds] = useState([])

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [assignModalTicket, setAssignModalTicket] = useState(null)
  const [resolveModalTicket, setResolveModalTicket] = useState(null)
  const [viewTicket, setViewTicket] = useState(null)
  const [editModalTicket, setEditModalTicket] = useState(null)

  // Form states
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "DATA_CORRECTION",
    priority: "MEDIUM",
  })
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "DATA_CORRECTION",
    priority: "MEDIUM",
  })
  const [selectedStaffId, setSelectedStaffId] = useState("")
  const [resolutionNotes, setResolutionNotes] = useState("")

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      let url = "http://localhost:8080/api/tickets?"
      if (statusFilter) url += `status=${statusFilter}&`
      if (priorityFilter) url += `priority=${priorityFilter}&`

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setTickets(data.data || [])
      }
    } catch (err) {
      console.error("Failed to load tickets:", err)
    } finally {
      setLoading(false)
    }
  }, [getToken, statusFilter, priorityFilter])

  const fetchStaffUsers = useCallback(async () => {
    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setStaffUsers(data.data || [])
      }
    } catch (err) {
      console.error("Failed to load staff users:", err)
    }
  }, [getToken])

  useEffect(() => {
    fetchTickets()
    fetchStaffUsers()
  }, [fetchTickets, fetchStaffUsers])

  // Handle Create Ticket
  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      setFeedback({ type: "error", message: "Title and description are required." })
      return
    }

    try {
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: `Ticket raised! Reference: ${data.data.ticketNumber}` })
        setIsCreateOpen(false)
        setNewTicket({
          title: "",
          description: "",
          category: "DATA_CORRECTION",
          priority: "MEDIUM",
        })
        fetchTickets()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to raise ticket." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error submitting support ticket." })
    }
  }

  // Handle Modify / Update Ticket Details (Ticket Modification)
  const handleUpdateTicket = async (e) => {
    e.preventDefault()
    if (!editModalTicket || !editForm.title.trim() || !editForm.description.trim()) {
      setFeedback({ type: "error", message: "Title and description are required." })
      return
    }

    try {
      setLoading(true)
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/tickets/${editModalTicket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          category: editForm.category,
          priority: editForm.priority,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({
          type: "success",
          message: `Ticket ${editModalTicket.ticketNumber} details updated successfully!`,
        })
        setEditModalTicket(null)
        fetchTickets()
      } else {
        setFeedback({
          type: "error",
          message: data.message || data.error?.message || "Failed to update ticket.",
        })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error updating support ticket." })
    } finally {
      setLoading(false)
    }
  }

  // Handle Assign Ticket
  const handleAssignTicket = async (e) => {
    e.preventDefault()
    if (!assignModalTicket || !selectedStaffId) return

    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/tickets/${assignModalTicket.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedToUserId: Number(selectedStaffId) }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: "Ticket assigned successfully!" })
        setAssignModalTicket(null)
        setSelectedStaffId("")
        fetchTickets()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to assign ticket." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error assigning ticket." })
    }
  }

  // Handle Resolve Ticket
  const handleResolveTicket = async (e) => {
    e.preventDefault()
    if (!resolveModalTicket || !resolutionNotes.trim()) {
      setFeedback({ type: "error", message: "Resolution notes are required." })
      return
    }

    try {
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/tickets/${resolveModalTicket.id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resolutionNotes }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({ type: "success", message: "Ticket resolved and marked closed!" })
        setResolveModalTicket(null)
        setResolutionNotes("")
        fetchTickets()
      } else {
        setFeedback({ type: "error", message: data.message || "Failed to resolve ticket." })
      }
    } catch (err) {
      setFeedback({ type: "error", message: "Error resolving ticket." })
    }
  }

  // Selection handlers
  const handleToggleSelectTicket = (id) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const currentFilteredIds = new Set(filteredTickets.map((t) => t.id))
      setSelectedTicketIds((prev) => prev.filter((id) => !currentFilteredIds.has(id)))
    } else {
      const currentFilteredIds = filteredTickets.map((t) => t.id)
      setSelectedTicketIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedTicketIds.length === 0) return
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${selectedTicketIds.length} selected ticket(s)? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      setLoading(true)
      setFeedback(null)
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/tickets/batch", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketIds: selectedTicketIds }),
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || `Successfully deleted ${selectedTicketIds.length} ticket(s)!`,
        })
        setSelectedTicketIds([])
        fetchTickets()
      } else {
        throw new Error(data.error?.message || "Failed to delete selected tickets")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSingleTicket = async (id, ticketNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ticket ${ticketNumber}? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      setLoading(true)
      setFeedback(null)
      const token = await getToken()
      const res = await fetch(`http://localhost:8080/api/tickets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || `Ticket ${ticketNumber} deleted successfully!`,
        })
        setSelectedTicketIds((prev) => prev.filter((item) => item !== id))
        fetchTickets()
      } else {
        throw new Error(data.error?.message || "Failed to delete ticket")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase()
    return (
      t.ticketNumber?.toLowerCase().includes(q) ||
      t.title?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.raisedByName?.toLowerCase().includes(q)
    )
  })

  const isAllSelected =
    filteredTickets.length > 0 &&
    filteredTickets.every((t) => selectedTicketIds.includes(t.id))

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/40">URGENT</Badge>
      case "HIGH":
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">HIGH</Badge>
      case "MEDIUM":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">MEDIUM</Badge>
      default:
        return <Badge variant="outline" className="text-muted-foreground">LOW</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 flex items-center gap-1">
            <CheckCheck className="w-3 h-3" />
            {status}
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            IN PROGRESS
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-amber-500/40 text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            OPEN
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Support & Issue Tickets</h1>
              <p className="text-sm text-muted-foreground">
                Internal ticketing system for data correction, IT assistance, student inquiries, and admin requests.
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
          {selectedTicketIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              disabled={loading}
              className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedTicketIds.length})
            </Button>
          )}
          <Button variant="outline" onClick={fetchTickets} disabled={loading} size="sm" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Raise Ticket
          </Button>
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

      {/* Ticket List Card */}
      <Card className="border-border">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">
              Active Ticket Board ({filteredTickets.length})
              {selectedTicketIds.length > 0 && (
                <span className="ml-2 text-xs font-normal text-indigo-400">
                  ({selectedTicketIds.length} selected)
                </span>
              )}
            </CardTitle>
            <CardDescription>Track resolution progress and assign responsibility</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedTicketIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                disabled={loading}
                className="h-9 gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selectedTicketIds.length})
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ticket # or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-[180px] md:w-[220px]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all tickets"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-border text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer accent-indigo-600"
                    />
                  </TableHead>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Title & Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Raised By</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No support tickets found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((tk) => (
                    <TableRow key={tk.id} className="hover:bg-muted/30">
                      <TableCell className="w-10">
                        <input
                          type="checkbox"
                          aria-label={`Select ticket ${tk.ticketNumber}`}
                          checked={selectedTicketIds.includes(tk.id)}
                          onChange={() => handleToggleSelectTicket(tk.id)}
                          className="rounded border-border text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer accent-indigo-600"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-indigo-400">
                        {tk.ticketNumber}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
                        <p className="font-semibold text-foreground text-sm truncate">{tk.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{tk.description}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {tk.category?.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(tk.priority)}</TableCell>
                      <TableCell>{getStatusBadge(tk.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tk.raisedByName || "Staff"}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {tk.assignedToName ? (
                          <span className="text-indigo-400">{tk.assignedToName}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewTicket(tk)}
                            className="h-7 px-2 text-xs"
                          >
                            Details
                          </Button>
                          {tk.status !== "RESOLVED" && tk.status !== "CLOSED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditModalTicket(tk)
                                setEditForm({
                                  title: tk.title || "",
                                  description: tk.description || "",
                                  category: tk.category || "DATA_CORRECTION",
                                  priority: tk.priority || "MEDIUM",
                                })
                              }}
                              className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                              title="Modify Ticket"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {(role === "ADMIN" || role === "PRINCIPAL") && tk.status !== "RESOLVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAssignModalTicket(tk)
                                setSelectedStaffId(tk.assignedToId ? String(tk.assignedToId) : "")
                              }}
                              className="h-7 px-2 text-xs text-indigo-400 hover:text-indigo-300"
                            >
                              Assign
                            </Button>
                          )}
                          {tk.status !== "RESOLVED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setResolveModalTicket(tk)
                                setResolutionNotes("")
                              }}
                              className="h-7 px-2 text-xs text-emerald-400 hover:text-emerald-300"
                            >
                              Resolve
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSingleTicket(tk.id, tk.ticketNumber)}
                            className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Delete Ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL 1: RAISE TICKET */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-500" />
                Raise Internal Support Ticket
              </h2>
              <button onClick={() => setIsCreateOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Ticket Title *</label>
                <Input
                  placeholder="e.g. Student DOB correction request - Grade 10A"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Category *</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="DATA_CORRECTION">Data Correction</option>
                    <option value="TECHNICAL">Technical Issue</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                    <option value="ACADEMIC">Academic Inquiry</option>
                    <option value="OTHER">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Priority *</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Detailed Description *</label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue or data adjustment needed, student registration number, or system error..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full rounded-md border border-border bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Submit Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN STAFF */}
      {assignModalTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                Assign Ticket: {assignModalTicket.ticketNumber}
              </h3>
              <button onClick={() => setAssignModalTicket(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTicket} className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">{assignModalTicket.title}</p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Assign Responsibility To</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Staff Member --</option>
                  {staffUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setAssignModalTicket(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Confirm Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESOLVE TICKET */}
      {resolveModalTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-emerald-500" />
                Resolve Ticket: {resolveModalTicket.ticketNumber}
              </h3>
              <button onClick={() => setResolveModalTicket(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveTicket} className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium">{resolveModalTicket.title}</p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Resolution Notes *</label>
                <textarea
                  rows={4}
                  placeholder="Explain what steps were taken to resolve this ticket or what records were corrected..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full rounded-md border border-border bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setResolveModalTicket(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Mark as Resolved
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW TICKET DETAILS */}
      {viewTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-xs text-indigo-400 font-semibold">{viewTicket.ticketNumber}</span>
                <h3 className="font-bold text-foreground text-lg">{viewTicket.title}</h3>
              </div>
              <button onClick={() => setViewTicket(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs uppercase font-semibold">Priority:</span>
                {getPriorityBadge(viewTicket.priority)}
                <span className="text-muted-foreground text-xs uppercase font-semibold ml-4">Status:</span>
                {getStatusBadge(viewTicket.status)}
              </div>

              <div className="bg-muted/30 p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Description:</p>
                <p className="text-foreground whitespace-pre-line">{viewTicket.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  <span className="font-medium text-foreground">{viewTicket.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Raised By:</span>{" "}
                  <span className="font-medium text-foreground">{viewTicket.raisedByName || "Staff"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned To:</span>{" "}
                  <span className="font-medium text-foreground">{viewTicket.assignedToName || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created Date:</span>{" "}
                  <span className="font-medium text-foreground">{viewTicket.createdAt ? new Date(viewTicket.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>

              {viewTicket.resolutionNotes && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg space-y-1">
                  <p className="text-xs font-bold text-emerald-400 uppercase">Resolution Notes:</p>
                  <p className="text-xs text-emerald-200">{viewTicket.resolutionNotes}</p>
                  {viewTicket.resolvedAt && (
                    <p className="text-[10px] text-muted-foreground">
                      Resolved on: {new Date(viewTicket.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <Button size="sm" onClick={() => setViewTicket(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: MODIFY / UPDATE TICKET DETAILS */}
      {editModalTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-amber-500" />
                  Modify Ticket: {editModalTicket.ticketNumber}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update issue details, adjust category or escalate priority while open.
                </p>
              </div>
              <button onClick={() => setEditModalTicket(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Ticket Title *</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Student DOB correction request"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Category *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="DATA_CORRECTION">Data Correction</option>
                    <option value="TECHNICAL">Technical Issue</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                    <option value="ACADEMIC">Academic Inquiry</option>
                    <option value="OTHER">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Priority *</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Detailed Description *</label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-md border border-border bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setEditModalTicket(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
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
