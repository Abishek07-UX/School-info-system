import { useState } from 'react'
import { useAuthUser } from '../context/AuthUserContext'

export default function PendingApprovalView({ onEditProfile }) {
  const { userProfile, refreshUser, loading } = useAuthUser()
  const [checking, setChecking] = useState(false)

  const handleCheckStatus = async () => {
    setChecking(true)
    await refreshUser()
    setChecking(false)
  }

  const fullName = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Staff Member'

  return (
    <div style={{ maxWidth: '720px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          margin: '0 auto 1.25rem auto'
        }}>
          ⏳
        </div>

        <span className="role-badge" style={{
          background: 'rgba(245, 158, 11, 0.2)',
          borderColor: 'rgba(245, 158, 11, 0.5)',
          color: '#fcd34d',
          marginBottom: '1rem',
          display: 'inline-block'
        }}>
          Status: Awaiting Role Assignment
        </span>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', margin: '0.5rem 0 0.5rem 0' }}>
          Registration Submitted, {fullName}!
        </h1>

        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.98rem', marginBottom: '2rem' }}>
          Your staff identification details are saved in the database. A School Administrator can now review your verified details in the management portal and assign your role (Teacher, Finance Staff, Principal, or Admin).
        </p>

        {/* Submitted Details Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-glass)',
          borderRadius: '14px',
          padding: '1.5rem',
          textAlign: 'left',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>🪪 Submitted Staff Record</span>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✏️ Edit Details
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'block' }}>Full Name</span>
              <strong style={{ color: 'var(--text-main)' }}>{fullName}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'block' }}>Official Email</span>
              <strong style={{ color: '#93c5fd' }}>{userProfile?.email || 'N/A'}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'block' }}>National ID (NIC)</span>
              <strong style={{ color: '#fcd34d', fontFamily: 'monospace' }}>{userProfile?.nicNumber || 'N/A'}</strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'block' }}>Phone Number</span>
              <strong style={{ color: 'var(--text-main)' }}>{userProfile?.phoneNumber || 'N/A'}</strong>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', display: 'block' }}>Residential Address</span>
              <span style={{ color: 'var(--text-muted)' }}>{userProfile?.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckStatus}
          disabled={checking || loading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', opacity: checking ? 0.7 : 1, padding: '0.85rem' }}
        >
          {checking ? '🔄 Checking Status...' : '🔄 Check Approval Status'}
        </button>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '1.5rem' }}>
          💡 Once an Administrator assigns your role, clicking "Check Approval Status" will immediately unlock your portal.
        </p>
      </div>
    </div>
  )
}
