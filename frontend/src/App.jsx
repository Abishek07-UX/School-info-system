import { useState } from 'react'
import { Show, SignInButton, UserButton, useUser } from '@clerk/react'
import { AuthUserProvider, useAuthUser } from './context/AuthUserContext'
import OnboardingView from './components/OnboardingView'
import PendingApprovalView from './components/PendingApprovalView'
import UserRoleManagement from './components/admin/UserRoleManagement'
import StaffProfileModal from './components/StaffProfileModal'
import TestApiView from './components/TestApiView'

function DashboardView({ onOpenProfile }) {
  const { user } = useUser()
  const { userProfile, role, isAdmin, loading } = useAuthUser()
  const [activeTab, setActiveTab] = useState('overview')

  const allModules = [
    { id: 'students', name: 'Student Management', icon: '🎓', count: '1,248 Students', desc: 'Register students, manage profiles & academic history', roles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] },
    { id: 'teachers', name: 'Teacher Management', icon: '👨‍🏫', count: '64 Staff Members', desc: 'Teacher profiles & subject-class assignments', roles: ['ADMIN', 'PRINCIPAL'] },
    { id: 'attendance', name: 'Attendance Management', icon: '📋', count: '96.4% Today', desc: 'Daily student & teacher attendance tracking', roles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] },
    { id: 'academics', name: 'Academics & Exams', icon: '📊', count: '12 Active Exams', desc: 'Mark entry, auto-grade conversion & report cards', roles: ['ADMIN', 'PRINCIPAL', 'TEACHER'] },
    { id: 'finance', name: 'Finance Management', icon: '💰', count: '$42.5k Collected', desc: 'Fee structures & offline payment logging', roles: ['ADMIN', 'PRINCIPAL', 'FINANCE_STAFF'] },
    { id: 'admin', name: 'Administration & Roles', icon: '⚙️', count: 'Staff & Roles', desc: 'User & Role Management, staff onboarding & timetable permissions', roles: ['ADMIN', 'PRINCIPAL'] },
    { id: 'tickets', name: 'Support Tickets', icon: '🎫', count: '3 Pending', desc: 'Internal operational issue reporting & tracking', roles: ['ADMIN', 'PRINCIPAL', 'TEACHER', 'FINANCE_STAFF'] },
  ]

  const allowedModules = allModules.filter(mod => mod.roles.includes(role))

  const getRoleBadgeStyle = (r) => {
    switch (r) {
      case 'ADMIN': return { bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 0.5)', color: '#f472b6', label: '👑 Administrator' }
      case 'PRINCIPAL': return { bg: 'rgba(192, 132, 252, 0.2)', border: 'rgba(192, 132, 252, 0.5)', color: '#c084fc', label: '🎓 Principal' }
      case 'TEACHER': return { bg: 'rgba(129, 140, 248, 0.2)', border: 'rgba(129, 140, 248, 0.5)', color: '#818cf8', label: '👨‍🏫 Teaching Staff' }
      case 'FINANCE_STAFF': return { bg: 'rgba(52, 211, 153, 0.2)', border: 'rgba(52, 211, 153, 0.5)', color: '#34d399', label: '💰 Finance Staff' }
      default: return { bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.5)', color: '#fcd34d', label: '⏳ Pending Assignment' }
    }
  }

  const badge = getRoleBadgeStyle(role)
  const displayName = userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : (user?.firstName || 'Staff Member')

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
        <div>Loading your staff profile & permissions...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Welcome back, {displayName} 👋
            </h1>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '700',
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.color
            }}>
              {badge.label}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            School Information System — Operational Portal
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenProfile}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              color: '#cbd5e1',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🪪 My Profile
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            style={{
              background: activeTab === 'overview' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              color: activeTab === 'overview' ? '#fff' : 'var(--text-muted)',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📊 Modules Overview
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                background: activeTab === 'admin' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: activeTab === 'admin' ? '#fff' : 'var(--text-muted)',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ⚙️ User & Role Management
            </button>
          )}
        </div>
      </div>

      {activeTab === 'admin' && isAdmin ? (
        <UserRoleManagement />
      ) : (
        <>
          {/* Stats Quick Overview */}
          <div className="stats-grid">
            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#818cf8' }}>🎓</div>
              <div>
                <div className="stat-value">1,248</div>
                <div className="stat-label">Enrolled Students</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#c084fc' }}>👨‍🏫</div>
              <div>
                <div className="stat-value">64</div>
                <div className="stat-label">Teaching Staff</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#34d399' }}>📋</div>
              <div>
                <div className="stat-value">96.4%</div>
                <div className="stat-label">Today's Attendance</div>
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-icon-wrapper" style={{ color: '#fbbf24' }}>🎫</div>
              <div>
                <div className="stat-value">3</div>
                <div className="stat-label">Open Support Tickets</div>
              </div>
            </div>
          </div>

          {/* Module Selector & Navigation */}
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '1rem' }}>
            Your Accessible Modules ({role})
          </h2>

          <div className="modules-grid">
            {allowedModules.map((mod) => (
              <div
                key={mod.id}
                className="glass-panel module-card"
                style={{
                  cursor: mod.id === 'admin' && isAdmin ? 'pointer' : 'default',
                  border: mod.id === 'admin' && isAdmin ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid var(--border-glass)'
                }}
                onClick={() => {
                  if (mod.id === 'admin' && isAdmin) {
                    setActiveTab('admin')
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="module-icon">{mod.icon}</span>
                  <span className="role-badge">{mod.count}</span>
                </div>
                <div className="module-title">{mod.name}</div>
                <div className="module-desc">{mod.desc}</div>
                {mod.id === 'admin' && isAdmin && (
                  <div style={{ marginTop: '0.5rem', color: '#f472b6', fontSize: '0.85rem', fontWeight: '600' }}>
                    Click to manage staff accounts →
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AuthenticatedPortal({ onOpenProfile }) {
  const { isProfileComplete, isPending, loading } = useAuthUser()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
        <div style={{ fontSize: '1.1rem' }}>Loading your staff account details...</div>
      </div>
    )
  }

  // Step 1: User MUST complete mandatory profile details before anything else
  if (!isProfileComplete) {
    return <OnboardingView />
  }

  // Step 2: Once details are in DB, if role is PENDING, show Pending Approval waiting screen
  if (isPending) {
    return <PendingApprovalView onEditProfile={onOpenProfile} />
  }

  // Step 3: Approved user enters full dashboard
  return <DashboardView onOpenProfile={onOpenProfile} />
}

function LandingView({ isClerkConfigured }) {
  return (
    <div className="hero-container">
      {!isClerkConfigured && (
        <div className="warning-banner">
          <span>⚠️</span>
          <div>
            <strong>Clerk Key Notice:</strong> Please copy <code>.env.example</code> to <code>.env</code> inside the <code>frontend/</code> directory and add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable live login authentication.
          </div>
        </div>
      )}

      <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
        <span className="role-badge" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
          🏫 Staff-Facing Academic Platform
        </span>
      </div>

      <h1 className="hero-title">
        School Information System
      </h1>
      <p className="hero-subtitle">
        Centralized operations for school staff — manage student records, daily attendance, academic exams, fee records, and timetables in one place.
      </p>

      {isClerkConfigured ? (
        <SignInButton mode="modal">
          <button className="btn-primary">
            🔐 Sign In to Staff Portal
          </button>
        </SignInButton>
      ) : (
        <button className="btn-primary" onClick={() => alert('Add your VITE_CLERK_PUBLISHABLE_KEY in frontend/.env to enable login!')}>
          🔐 Sign In Demo (Setup .env required)
        </button>
      )}

      <div className="modules-grid">
        <div className="glass-panel module-card">
          <div className="module-icon">🎓</div>
          <div className="module-title">Student Management</div>
          <div className="module-desc">Centralized student records, enrollment profiles, and multi-filter search.</div>
        </div>

        <div className="glass-panel module-card">
          <div className="module-icon">📋</div>
          <div className="module-title">Attendance Tracking</div>
          <div className="module-desc">Fast daily student & teacher attendance recording with historical reporting.</div>
        </div>

        <div className="glass-panel module-card">
          <div className="module-icon">📊</div>
          <div className="module-title">Exams & Report Cards</div>
          <div className="module-desc">Numerical mark entry with automatic letter grade conversion and transcript generation.</div>
        </div>

        <div className="glass-panel module-card">
          <div className="module-icon">💰</div>
          <div className="module-title">Finance & Fee Ledger</div>
          <div className="module-desc">Track fee structures, record offline payment collections, and manage outstanding balances.</div>
        </div>
      </div>
    </div>
  )
}

function MainApp({ isClerkConfigured = true }) {
  const [showTestApi, setShowTestApi] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  return (
    <>
      <header className="app-header">
        <div className="brand-logo">
          <div className="brand-icon">🏫</div>
          SchoolInfo System
        </div>

        <div className="user-nav">
          <button
            onClick={() => setShowTestApi(prev => !prev)}
            style={{
              background: showTestApi ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.5)',
              color: '#a5b4fc',
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
          >
            {showTestApi ? '← Back to Portal' : '⚡ Test API'}
          </button>

          {isClerkConfigured ? (
            <>
              <Show when="signed-in">
                <button
                  onClick={() => setShowProfileModal(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-glass)',
                    color: '#cbd5e1',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🪪 Profile
                </button>
                <UserButton afterSignOutUrl="/" />
              </Show>

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                    Sign In
                  </button>
                </SignInButton>
              </Show>
            </>
          ) : (
            <span className="role-badge" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}>
              Preview Mode
            </span>
          )}
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {showTestApi ? (
          <TestApiView />
        ) : isClerkConfigured ? (
          <>
            <Show when="signed-in">
              <AuthenticatedPortal onOpenProfile={() => setShowProfileModal(true)} />
            </Show>
            <Show when="signed-out">
              <LandingView isClerkConfigured={isClerkConfigured} />
            </Show>
          </>
        ) : (
          <LandingView isClerkConfigured={false} />
        )}
      </main>

      <StaffProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <footer style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        color: 'var(--text-dim)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border-glass)'
      }}>
        School Information System &copy; {new Date().getFullYear()} — Internal Staff Portal
      </footer>
    </>
  )
}

export default function App({ isClerkConfigured = true }) {
  return (
    <AuthUserProvider>
      <MainApp isClerkConfigured={isClerkConfigured} />
    </AuthUserProvider>
  )
}
