import { useState, useEffect } from 'react'
import { useAuthUser } from '../context/AuthUserContext'
import { useUser } from '@clerk/react'

export default function StaffProfileModal({ isOpen, onClose, required = false }) {
  const { userProfile, updateProfile } = useAuthUser()
  const { user: clerkUser } = useUser()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    nicNumber: '',
    address: ''
  })
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || clerkUser?.firstName || '',
        lastName: userProfile.lastName || clerkUser?.lastName || '',
        email: (!userProfile.email || userProfile.email.endsWith('@placeholder.com'))
          ? (clerkUser?.primaryEmailAddress?.emailAddress || '')
          : userProfile.email,
        phoneNumber: userProfile.phoneNumber || clerkUser?.primaryPhoneNumber?.phoneNumber || '',
        nicNumber: userProfile.nicNumber || '',
        address: userProfile.address || ''
      })
    }
  }, [userProfile, clerkUser])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Please enter a valid email address.')
      }
      if (formData.phoneNumber) {
        const cleanPhone = formData.phoneNumber.trim().replaceAll(/[\s\-()]/g, '')
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          throw new Error('Phone number must contain exactly 10 digits with no letters or symbols (e.g. 0771234567).')
        }
        formData.phoneNumber = cleanPhone
      }

      if (!formData.nicNumber || !formData.nicNumber.trim()) {
        throw new Error('National Identity Card (NIC) number is required.')
      }

      const cleanNic = formData.nicNumber.trim().toUpperCase()
      if (!/^([0-9]{12}|[0-9]{9}V)$/.test(cleanNic)) {
        throw new Error("NIC number must be either 12 digits (e.g. 199012345678) or 9 digits followed by 'V' (e.g. 901234567V).")
      }
      formData.nicNumber = cleanNic

      await updateProfile(formData)
      setSuccessMsg('Staff details saved successfully to database!')
      setTimeout(() => {
        if (onClose) onClose()
      }, 1200)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '2rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {!required && onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.8rem' }}>🪪</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', margin: 0 }}>
            {required ? 'Complete Your Staff Profile' : 'Edit Staff Profile'}
          </h2>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Please provide your official staff identification details. This information is securely stored in the school database.
        </p>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* First & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. John"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Doe"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Official Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. john.doe@school.com"
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Phone & NIC Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Phone Number (10 Digits) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={formData.phoneNumber}
                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="e.g. 0771234567"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                NIC Number (National ID) *
              </label>
              <input
                type="text"
                required
                value={formData.nicNumber}
                onChange={e => setFormData({ ...formData, nicNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. 199012345678 or 901234567V"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Residential Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Residential Address *
            </label>
            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. No. 45, Temple Road, Colombo"
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.9rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            {!required && onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-muted)',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
            >
              {saving ? '💾 Saving Details...' : '💾 Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
