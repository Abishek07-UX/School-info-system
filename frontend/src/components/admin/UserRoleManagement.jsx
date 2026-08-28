import { useState, useEffect, useCallback } from 'react'
import { useAuthUser } from '../../context/AuthUserContext'

const ROLES = [
  { value: 'PENDING', label: '⏳ PENDING (Unassigned)', color: '#f59e0b' },
  { value: 'TEACHER', label: '👨‍🏫 Teacher', color: '#818cf8' },
  { value: 'FINANCE_STAFF', label: '💰 Finance Staff', color: '#34d399' },
  { value: 'PRINCIPAL', label: '🎓 Principal', color: '#c084fc' },
  { value: 'ADMIN', label: '👑 Administrator', color: '#ec4899' },
]

export default function UserRoleManagement() {
  const { getToken, userProfile } = useAuthUser()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('ALL')
  const [feedback, setFeedback] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const res = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error(`Failed to load users (${res.status})`)
      }

      const resData = await res.json()
      if (resData.success) {
        setUsers(resData.data || [])
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoadingId(userId)
      setFeedback(null)
      const token = await getToken()

      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })

      const resData = await res.json()
      if (res.ok && resData.success) {
        setUsers(prev => prev.map(u => u.id === userId ? resData.data : u))
        setFeedback({ type: 'success', message: `Updated user role to ${newRole} successfully!` })
      } else {
        throw new Error(resData?.error?.message || 'Failed to update user role')
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      setActionLoadingId(userId)
      setFeedback(null)
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const token = await getToken()

      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      const resData = await res.json()
      if (res.ok && resData.success) {
        setUsers(prev => prev.map(u => u.id === userId ? resData.data : u))
        setFeedback({ type: 'success', message: `User status changed to ${newStatus}!` })
      } else {
        throw new Error(resData?.error?.message || 'Failed to update user status')
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete staff account ${email}?`)) {
      return
    }

    try {
      setActionLoadingId(userId)
      setFeedback(null)
      const token = await getToken()

      const res = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const resData = await res.json()
      if (res.ok && resData.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        setFeedback({ type: 'success', message: `User ${email} deleted successfully.` })
      } else {
        throw new Error(resData?.error?.message || 'Failed to delete user')
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
    const matchesSearch = 
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.includes(searchTerm.toLowerCase()) ||
      (user.nicNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = filterRole === 'ALL' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const pendingCount = users.filter(u => u.role === 'PENDING').length
  const activeCount = users.filter(u => u.status === 'ACTIVE').length

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Header & Quick stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            ⚙️ User & Role Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Review registered staff, view demographic information (NIC, Contact, Address), and assign official roles.
          </p>
        </div>

        <button onClick={fetchUsers} disabled={loading} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          {loading ? '🔄 Refreshing...' : '🔄 Refresh Users'}
        </button>
      </div>

      {/* Metric Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Registered</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: '#818cf8' }}>{users.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderColor: pendingCount > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-glass)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Role Assignment</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: '#f59e0b' }}>
            {pendingCount} {pendingCount > 0 && '⚠️'}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Accounts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', color: '#34d399' }}>{activeCount}</div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
          color: feedback.type === 'error' ? '#fca5a5' : '#6ee7b7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <input
          type="text"
          placeholder="🔍 Search staff by name, email, NIC, or phone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: '1 1 250px',
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-glass)',
            borderRadius: '8px',
            padding: '0.6rem 1rem',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'TEACHER', 'FINANCE_STAFF', 'ADMIN'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              style={{
                background: filterRole === r ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: filterRole === r ? '#fff' : 'var(--text-muted)',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {r} {r === 'PENDING' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem 0.75rem' }}>Staff Member</th>
              <th style={{ padding: '1rem 0.75rem' }}>NIC Number</th>
              <th style={{ padding: '1rem 0.75rem' }}>Contact & Address</th>
              <th style={{ padding: '1rem 0.75rem' }}>Assigned Role</th>
              <th style={{ padding: '1rem 0.75rem' }}>Status</th>
              <th style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading staff accounts...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No registered users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => {
                const isCurrent = user.id === userProfile?.id
                const isUpdating = actionLoadingId === user.id
                const fullName = user.firstName || user.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                  : 'Name Not Provided'

                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s' }}>
                    {/* Name & Email */}
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {fullName}
                        {isCurrent && (
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                            You
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#93c5fd' }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Clerk: <code>{user.clerkId}</code>
                      </div>
                    </td>

                    {/* NIC Number */}
                    <td style={{ padding: '1rem 0.75rem' }}>
                      {user.nicNumber ? (
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          fontFamily: 'monospace',
                          background: 'rgba(15, 23, 42, 0.6)',
                          border: '1px solid var(--border-glass)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          color: '#fcd34d'
                        }}>
                          {user.nicNumber}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                          Not provided
                        </span>
                      )}
                    </td>

                    {/* Phone & Address */}
                    <td style={{ padding: '1rem 0.75rem', maxWidth: '220px' }}>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.82rem' }}>
                        📞 {user.phoneNumber || <span style={{ color: 'var(--text-dim)' }}>No phone</span>}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.address}>
                        🏠 {user.address || <span style={{ color: 'var(--text-dim)' }}>No address</span>}
                      </div>
                    </td>

                    {/* Role selector */}
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <select
                        value={user.role}
                        disabled={isUpdating || (isCurrent && user.role === 'ADMIN')}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: user.role === 'PENDING' ? '1px solid #f59e0b' : '1px solid var(--border-glass)',
                          color: user.role === 'PENDING' ? '#fcd34d' : 'var(--text-main)',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        {ROLES.map(r => (
                          <option key={r.value} value={r.value} style={{ background: '#0f172a', color: '#f8fafc' }}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Status toggle */}
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <button
                        onClick={() => handleStatusToggle(user.id, user.status)}
                        disabled={isUpdating || isCurrent}
                        style={{
                          background: user.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          border: `1px solid ${user.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                          color: user.status === 'ACTIVE' ? '#34d399' : '#f87171',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: isCurrent ? 'default' : 'pointer'
                        }}
                        title={isCurrent ? "Cannot deactivate your own account" : "Click to toggle status"}
                      >
                        {user.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
                      </button>
                    </td>

                    {/* Delete Action */}
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        disabled={isUpdating || isCurrent}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '0.35rem 0.7rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          cursor: isCurrent ? 'not-allowed' : 'pointer',
                          opacity: isCurrent ? 0.4 : 1
                        }}
                        title={isCurrent ? "Cannot delete yourself" : "Delete user account"}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
