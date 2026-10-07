import { useState, useEffect, useCallback } from "react"
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
import { PageHeader } from "@/components/ui/page-header"
import { StatTile } from "@/components/ui/stat-tile"
import { FilterBar, FilterField, SearchInput } from "@/components/ui/filter-bar"
import { TableEmptyRow } from "@/components/ui/empty-state"
import { useToast } from "@/context/ToastContext"
import { useConfirm } from "@/context/ConfirmContext"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Shield, Users, Clock, Trash2, RefreshCw, Phone, MapPin, Eye, UserCheck, SearchX } from "lucide-react"

const ROLES = [
  { value: "PENDING", label: "Pending (unassigned)", short: "Pending", badgeVariant: "warning" },
  { value: "TEACHER", label: "Teacher", short: "Teacher", badgeVariant: "secondary" },
  { value: "FINANCE_STAFF", label: "Finance Staff", short: "Finance", badgeVariant: "success" },
  { value: "PRINCIPAL", label: "Principal", short: "Principal", badgeVariant: "default" },
  { value: "ADMIN", label: "Administrator", short: "Admin", badgeVariant: "default" },
]

export default function UserRoleManagement() {
  const { getToken, userProfile, isAdmin } = useAuthUser()
  const readOnly = !isAdmin
  const columnCount = readOnly ? 5 : 6
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("ALL")
  const toast = useToast()
  const confirm = useConfirm()
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
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken, toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId, newRole) => {
    if (readOnly) return
    try {
      setActionLoadingId(userId)
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
        toast.success(`Updated user role to ${newRole} successfully!`)
      } else {
        throw new Error(resData?.error?.message || "Failed to update user role")
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleStatusToggle = async (userId, currentStatus, fullName) => {
    if (readOnly) return
    if (currentStatus === "ACTIVE") {
      const ok = await confirm({
        title: `Deactivate ${fullName}?`,
        description: "They'll keep their login but won't be able to open any module until you reactivate the account.",
        confirmLabel: "Deactivate",
        tone: "danger",
      })
      if (!ok) return
    }
    try {
      setActionLoadingId(userId)
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
        toast.success(newStatus === "ACTIVE" ? "Account reactivated." : "Account deactivated.")
      } else {
        throw new Error(resData?.error?.message || "Failed to update user status")
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteUser = async (userId, email) => {
    if (readOnly) return
    const ok = await confirm({
      title: "Delete this staff account?",
      description: `${email} will be removed permanently. This can't be undone.`,
      confirmLabel: "Delete account",
      tone: "danger",
    })
    if (!ok) return

    try {
      setActionLoadingId(userId)
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
        toast.success(`User ${email} deleted successfully.`)
      } else {
        throw new Error(resData?.error?.message || "Failed to delete user")
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredUsers = users
    .filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase()
      const query = searchTerm.toLowerCase()
      const matchesSearch =
        (user.email || "").toLowerCase().includes(query) ||
        fullName.includes(query) ||
        (user.nicNumber || "").toLowerCase().includes(query) ||
        (user.phoneNumber || "").toLowerCase().includes(query) ||
        (user.role || "").toLowerCase().includes(query)

      const matchesRole = filterRole === "ALL" || user.role === filterRole
      return matchesSearch && matchesRole
    })
    // Accounts waiting for a role go first so they're never missed
    .sort((a, b) => (a.role === "PENDING" ? 0 : 1) - (b.role === "PENDING" ? 0 : 1))

  const pendingCount = users.filter((u) => u.role === "PENDING").length
  const activeCount = users.filter((u) => u.status === "ACTIVE").length
  const roleCount = (role) => users.filter((u) => u.role === role).length
  const activeFilterCount = (filterRole !== "ALL" ? 1 : 0) + (searchTerm.trim() ? 1 : 0)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title={readOnly ? "Staff Directory" : "User & Role Management"}
        description={
          readOnly
            ? "Registered staff with their contact details, roles and account status."
            : "Verify new staff, assign roles and manage account access."
        }
        actions={
          <Button onClick={fetchUsers} disabled={loading} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      >
        {readOnly && (
          <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>View only</span>
            <span aria-hidden>·</span>
            <span>Only administrators can change roles or account status.</span>
          </div>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile icon={Users} label="Registered staff" value={users.length} tone="blue" />
        <StatTile
          icon={Clock}
          label="Waiting for a role"
          value={pendingCount}
          tone={pendingCount > 0 ? "amber" : "neutral"}
          hint={pendingCount > 0 && !readOnly ? "Assign a role to let them in" : undefined}
        />
        <StatTile icon={UserCheck} label="Active accounts" value={activeCount} tone="green" />
      </div>

      <FilterBar
        activeCount={activeFilterCount}
        onClear={() => {
          setSearchTerm("")
          setFilterRole("ALL")
        }}
        summary={!loading && `${filteredUsers.length} of ${users.length}`}
      >
        <FilterField label="Search" htmlFor="staff-search" className="w-full sm:w-72 sm:flex-none">
          <SearchInput id="staff-search" value={searchTerm} onChange={setSearchTerm} placeholder="Name, email, NIC or phone…" />
        </FilterField>
        <FilterField label="Role" htmlFor="staff-role" className="sm:w-48">
          <select id="staff-role" value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="h-9 w-full px-3 text-sm">
            <option value="ALL">All roles ({users.length})</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.short} ({roleCount(r.value)})
              </option>
            ))}
          </select>
        </FilterField>
      </FilterBar>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Staff member</TableHead>
            <TableHead>NIC</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            {!readOnly && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }, (_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                {!readOnly && <TableCell />}
              </TableRow>
            ))
          ) : filteredUsers.length === 0 ? (
            <TableEmptyRow
              colSpan={columnCount}
              icon={SearchX}
              title="No staff accounts found matching your query."
              description="Try a different name, email or role."
            />
          ) : (
            filteredUsers.map((user) => {
              const isCurrent = user.id === userProfile?.id
              const isUpdating = actionLoadingId === user.id
              const isPending = user.role === "PENDING"
              const isActive = user.status === "ACTIVE"
              const fullName =
                user.firstName || user.lastName
                  ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                  : "Name not provided"
              const initials = (user.firstName?.[0] || "S") + (user.lastName?.[0] || "M")
              const roleInfo = ROLES.find((r) => r.value === user.role)

              return (
                <TableRow key={user.id} className={cn(isPending && "bg-warning-soft/60 hover:bg-warning-soft")}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 whitespace-nowrap font-medium text-foreground">
                          {fullName}
                          {isCurrent && <Badge variant="info" className="px-1.5 py-0 text-[10px]">You</Badge>}
                          {isPending && !readOnly && (
                            <Badge variant="warning" className="px-1.5 py-0 text-[10px]">Needs role</Badge>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {user.nicNumber ? (
                      <span className="tabular whitespace-nowrap text-[13px] text-foreground-2">{user.nicNumber}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not provided</span>
                    )}
                  </TableCell>

                  <TableCell className="max-w-[16rem]">
                    <div className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-foreground-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {user.phoneNumber || <span className="text-muted-foreground">No phone</span>}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground" title={user.address}>
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{user.address || "No address"}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {readOnly ? (
                      <Badge variant={roleInfo?.badgeVariant || "secondary"}>{roleInfo?.label || user.role}</Badge>
                    ) : (
                      <select
                        value={user.role}
                        aria-label={`Role for ${fullName}`}
                        disabled={isUpdating || (isCurrent && user.role === "ADMIN")}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={cn("h-8 min-w-[10.5rem] px-2.5 text-[13px]", isPending && "border-warning/60")}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </TableCell>

                  <TableCell>
                    {readOnly ? (
                      <Badge variant={isActive ? "success" : "destructive"} dot>
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        disabled={isUpdating || isCurrent}
                        onClick={() => handleStatusToggle(user.id, user.status, fullName)}
                        title={isCurrent ? "Cannot deactivate yourself" : "Toggle account status"}
                        className={cn(
                          "group inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                          isActive ? "bg-success-soft text-success" : "bg-surface-2 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "relative block h-4 w-7 shrink-0 rounded-full transition-colors duration-200",
                            isActive ? "bg-success" : "bg-border-strong"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute left-0 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
                              isActive ? "translate-x-3.5" : "translate-x-0.5"
                            )}
                          />
                        </span>
                        {isActive ? "Active" : "Inactive"}
                      </button>
                    )}
                  </TableCell>

                  {!readOnly && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={isUpdating || isCurrent}
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="hover:bg-danger-soft hover:text-danger"
                        title={isCurrent ? "Cannot delete own account" : "Delete user"}
                        aria-label={`Delete ${fullName}`}
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
    </div>
  )
}
