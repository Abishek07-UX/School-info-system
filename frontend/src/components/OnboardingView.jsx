import { useState, useEffect } from 'react'
import { useAuthUser } from '../context/AuthUserContext'
import { useUser } from '@clerk/react'

export default function OnboardingView() {
  const { userProfile, updateProfile, refreshUser } = useAuthUser()
  const { user: clerkUser } = useUser()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    nicNumber: '',
    address: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    setFormData({
      firstName: userProfile?.firstName || clerkUser?.firstName || '',
      lastName: userProfile?.lastName || clerkUser?.lastName || '',
      email: (userProfile?.email && !userProfile.email.endsWith('@placeholder.com'))
        ? userProfile.email
        : (clerkUser?.primaryEmailAddress?.emailAddress || ''),
      phoneNumber: userProfile?.phoneNumber || clerkUser?.primaryPhoneNumber?.phoneNumber || '',
      nicNumber: userProfile?.nicNumber || '',
      address: userProfile?.address || ''
    })
  }, [userProfile, clerkUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and Last name are required.')
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        throw new Error('A valid email address is required.')
      }
      const cleanPhone = formData.phoneNumber.trim().replaceAll(/[\s\-()]/g, '')
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        throw new Error('Phone number must contain exactly 10 digits with no letters or symbols (e.g. 0771234567).')
      }

      const cleanNic = formData.nicNumber.trim().toUpperCase()
      if (!/^([0-9]{12}|[0-9]{9}V)$/.test(cleanNic)) {
        throw new Error("NIC number must be either 12 digits (e.g. 199012345678) or 9 digits followed by 'V' (e.g. 901234567V).")
      }

      if (!formData.address.trim()) {
        throw new Error('Residential address is required.')
      }

      await updateProfile({
        ...formData,
        phoneNumber: cleanPhone,
        nicNumber: cleanNic
      })
      await refreshUser()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        {/* Header Badge & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 1rem auto',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
          }}>
            🪪
          </div>

          <span className="role-badge" style={{
            background: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 0.5)',
            color: '#a5b4fc',
            marginBottom: '0.75rem',
            display: 'inline-block'
          }}>
            Step 1 of 2: Staff Identification
          </span>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', margin: '0.5rem 0' }}>
            Complete Your Staff Registration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '520px', margin: '0 auto' }}>
            All fields below are mandatory. Your details will be registered in the school database so an Administrator can verify your credentials and assign your staff role.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '0.85rem 1.2rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* First & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                First Name <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. Ruwan"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Last Name <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Perera"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Official Email Address <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. ruwan.perera@school.lk"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Phone Number & NIC Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Phone Number (10 Digits) <span style={{ color: '#f87171' }}>*</span>
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
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                NIC Number (National ID) <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nicNumber}
                onChange={e => setFormData({ ...formData, nicNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. 199012345678 or 901234567V"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '10px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Residential Address */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Residential Address <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. No. 120, Kandy Road, Colombo"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.95rem',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.9rem',
              fontSize: '1rem',
              marginTop: '0.5rem',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? '💾 Saving Registration Details...' : '💾 Submit & Proceed to Approval Queue →'}
          </button>
        </form>
      </div>
    </div>
  )
}
