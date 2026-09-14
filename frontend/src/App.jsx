import { useState } from 'react'
import { Show, SignInButton, UserButton, useUser } from '@clerk/react'
import TestApiView from './components/TestApiView'

import TeacherManagement from './components/TeacherManagement'

function DashboardView() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('students')

  const modules = [
    { id: 'students', name: 'Student Management', icon: '🎓', count: '1,248 Students', desc: 'Register students, manage profiles & academic history' },
    { id: 'teachers', name: 'Teacher Management', icon: '👨‍🏫', count: '64 Staff Members', desc: 'Teacher profiles & subject-class assignments' },
    { id: 'attendance', name: 'Attendance Management', icon: '📋', count: '96.4% Today', desc: 'Daily student & teacher attendance tracking' },
    { id: 'academics', name: 'Academics & Exams', icon: '📊', count: '12 Active Exams', desc: 'Mark entry, auto-grade conversion & report cards' },
    { id: 'finance', name: 'Finance Management', icon: '💰', count: '$42.5k Collected', desc: 'Fee structures & offline payment logging' },
    { id: 'admin', name: 'Administration', icon: '⚙️', count: 'Conflict-Free', desc: 'Timetables, classes, subjects & notification settings' },
    { id: 'tickets', name: 'Support Tickets', icon: '🎫', count: '3 Pending', desc: 'Internal operational issue reporting & tracking' },
  ]

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>
          Welcome back, {user?.firstName || 'Staff Member'} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          School Information System — Staff Operational Portal
        </p>
      </div>

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
        System Modules Overview
      </h2>

      <div className="modules-grid">
        {modules.map((mod) => (
          <div
            key={mod.id}
            className="glass-panel module-card"
            style={{
              borderColor: activeTab === mod.id ? 'var(--accent-primary)' : 'var(--border-glass)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(mod.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="module-icon">{mod.icon}</span>
              <span className="role-badge">{mod.count}</span>
            </div>
            <div className="module-title">{mod.name}</div>
            <div className="module-desc">{mod.desc}</div>
          </div>
        ))}
      </div>
            {activeTab === 'teachers' && (
        <TeacherManagement />
      )}
    </div>
  )
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

function App({ isClerkConfigured = true }) {
  const [showTestApi, setShowTestApi] = useState(false)

  return (
    <>
      <header className="app-header">
        <div className="brand-logo">
          <div className="brand-icon">🏫</div>
          SchoolInfo System
        </div>

        <div className="user-nav">
          {/* Test API Toggle */}
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
            {showTestApi ? '← Back to App' : '⚡ Test API'}
          </button>

          {isClerkConfigured ? (
            <>
              <Show when="signed-in">
                <span className="role-badge">Staff Account</span>
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
              <DashboardView />
            </Show>
            <Show when="signed-out">
              <LandingView isClerkConfigured={isClerkConfigured} />
            </Show>
          </>
        ) : (
          <LandingView isClerkConfigured={false} />
        )}
      </main>

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

export default App
