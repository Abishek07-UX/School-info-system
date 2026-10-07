import { useState, useEffect, useCallback } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import {
  Card,
} from "@/components/ui/card"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Shield,
  Users,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Phone,
  MapPin,
  Mail,
} from "lucide-react"

const ROLES = [
  { value: "PENDING", label: "PENDING (Unassigned)", badgeVariant: "warning" },
  { value: "TEACHER", label: "Teacher", badgeVariant: "secondary" },
  { value: "FINANCE_STAFF", label: "Finance Staff", badgeVariant: "success" },
  { value: "PRINCIPAL", label: "Principal", badgeVariant: "default" },
  { value: "ADMIN", label: "Administrator", badgeVariant: "default" },
]

export default function UserRoleManagement() {
  const { getToken, userProfile, isAdmin } = useAuthUser()
  const readOnly = !isAdmin
  const columnCount = readOnly ? 5 : 6
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("ALL")
  const [feedback, setFeedback] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const res = await fetch("http://localhost:8080/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to load users (${res.status})`)
      }

      const resData = await res.json()
      if (resData.success) {
        setUsers(resData.data || [])
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId, newRole) => {
    if (readOnly) return
    try {
      setActionLoadingId(userId)
      setFeedback(null)
      const token = await getToken()

      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      const resData = await res.json()
      if (res.ok && resData.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? resData.data : u)))
        setFeedback({
          type: "success",
          message: `Updated user role to ${newRole} successfully!`,
        })
      } else {
        throw new Error(resData?.error?.message || "Failed to update user role")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    if (readOnly) return
    try {
      setActionLoadingId(userId)
      setFeedback(null)
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      const token = await getToken()

      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const resData = await res.json()
      if (res.ok && resData.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? resData.data : u)))
        setFeedback({
          type: "success",
          message: `User status changed to ${newStatus}!`,
        })
      } else {
        throw new Error(resData?.error?.message || "Failed to update user status")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteUser = async (userId, email) => {
    if (readOnly) return
    if (!window.confirm(`Are you sure you want to delete staff account ${email}?`)) {
      return
    }

    try {
      setActionLoadingId(userId)
      setFeedback(null)
      const token = await getToken()

      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const resData = await res.json()
      if (res.ok && resData.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId))
        setFeedback({
          type: "success",
          message: `User ${email} deleted successfully.`,
        })
      } else {
        throw new Error(resData?.error?.message || "Failed to delete user")
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message })
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase()
    const matchesSearch =
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (user.nicNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === "ALL" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const pendingCount = users.filter((u) => u.role === "PENDING").length
  const activeCount = users.filter((u) => u.status === "ACTIVE").length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold font-heading text-foreground">
                {readOnly ? "Staff Directory" : "User & Role Management"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {readOnly
                  ? "Review registered staff, their contact details, roles, and account status."
                  : "Review registered staff identity credentials, verify NIC & phone contacts, and assign operational roles."}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={fetchUsers}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh Staff List"}
        </Button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Total Registered Staff</div>
            <div className="text-2xl font-normal text-foreground">{users.length}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface-2 border border-border text-accent-blue">
            <Users className="h-4 w-4" />
          </div>
        </Card>

        <Card className={`p-4 flex items-center justify-between ${pendingCount > 0 ? "border-warning/30" : ""}`}>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Pending Role Assignment</div>
            <div className="text-2xl font-normal text-foreground flex items-center gap-2">
              {pendingCount}
              {pendingCount > 0 && <Badge variant="warning" className="text-[10px]">Action Required</Badge>}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface-2 border border-border text-warning">
            <Clock className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Active Accounts</div>
            <div className="text-2xl font-normal text-foreground">{activeCount}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-surface-2 border border-border text-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {readOnly && (
        <Alert>
          <AlertTitle>View only</AlertTitle>
          <AlertDescription>Only administrators can change roles or account status.</AlertDescription>
        </Alert>
      )}

      {/* Feedback Toast Alert */}
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
      <Card className="p-4 border-border">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name, email, NIC, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-surface-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Role:
            </span>
            {["ALL", "PENDING", "TEACHER", "FINANCE_STAFF", "PRINCIPAL", "ADMIN"].map((r) => (
              <Button
                key={r}
                variant={filterRole === r ? "default" : "outline"}
                size="xs"
                onClick={() => setFilterRole(r)}
                className="text-[11px] font-semibold"
              >
                {r === "FINANCE_STAFF" ? "FINANCE" : r}
                {r === "PENDING" && pendingCount > 0 && ` (${pendingCount})`}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>NIC / National ID</TableHead>
              <TableHead>Contact & Address</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Status</TableHead>
              {!readOnly && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center py-12 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-accent-blue" />
                  Loading registered staff accounts...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center py-12 text-muted-foreground">
                  No staff accounts found matching your query.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isCurrent = user.id === userProfile?.id
                const isUpdating = actionLoadingId === user.id
                const fullName =
                  user.firstName || user.lastName
                    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                    : "Name Not Provided"
                const initials =
                  (user.firstName?.[0] || "S") + (user.lastName?.[0] || "M")

                return (
                  <TableRow key={user.id} className="hover:bg-surface-2">
                    {/* Name & Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-2">
                            {fullName}
                            {isCurrent && (
                              <Badge variant="outline" className="text-[10px] py-0 border-accent-blue/40 text-accent-blue">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-accent-blue flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* NIC */}
                    <TableCell>
                      {user.nicNumber ? (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-warning-soft text-warning border border-warning/20">
                          {user.nicNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not provided</span>
                      )}
                    </TableCell>

                    {/* Phone & Address */}
                    <TableCell className="max-w-xs">
                      <div className="text-xs text-foreground-2 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {user.phoneNumber || <span className="text-muted-foreground">No phone</span>}
                      </div>
                      <div
                        className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5 mt-0.5"
                        title={user.address}
                      >
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{user.address || "No address"}</span>
                      </div>
                    </TableCell>

                    {/* Role Select Dropdown */}
                    <TableCell>
                      {readOnly ? (
                        <Badge variant={ROLES.find((r) => r.value === user.role)?.badgeVariant || "secondary"}>
                          {ROLES.find((r) => r.value === user.role)?.label || user.role}
                        </Badge>
                      ) : (
                      <select
                        value={user.role}
                        disabled={isUpdating || (isCurrent && user.role === "ADMIN")}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="h-8 rounded-lg border border-border bg-surface-2 px-2 text-xs font-semibold text-foreground-2 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option
                            key={r.value}
                            value={r.value}
                            className="bg-surface-2 text-foreground"
                          >
                            {r.label}
                          </option>
                        ))}
                      </select>
                      )}
                    </TableCell>

                    {/* Status Toggle Button */}
                    <TableCell>
                      {readOnly ? (
                        <Badge variant={user.status === "ACTIVE" ? "success" : "destructive"}>
                          {user.status === "ACTIVE" ? "● Active" : "○ Inactive"}
                        </Badge>
                      ) : (
                      <Button
                        size="xs"
                        variant={user.status === "ACTIVE" ? "success" : "destructive"}
                        disabled={isUpdating || isCurrent}
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        className="text-[11px] font-semibold h-6"
                        title={isCurrent ? "Cannot deactivate yourself" : "Toggle account status"}
                      >
                        {user.status === "ACTIVE" ? "● Active" : "○ Inactive"}
                      </Button>
                      )}
                    </TableCell>

                    {/* Delete Action */}
                    {!readOnly && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isUpdating || isCurrent}
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger-soft"
                        title={isCurrent ? "Cannot delete own account" : "Delete user"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
