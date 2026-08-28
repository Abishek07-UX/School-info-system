import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/react'

const AuthUserContext = createContext(null)

export function AuthUserProvider({ children }) {
  const { isSignedIn, getToken } = useAuth()
  const { user: clerkUser } = useUser()
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserProfile = useCallback(async () => {
    if (!isSignedIn) {
      setUserProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const token = await getToken()
      
      const response = await fetch('http://localhost:8080/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}))
        throw new Error(errJson?.error?.message || `Server responded with ${response.status}`)
      }

      const resData = await response.json()
      if (resData.success && resData.data) {
        setUserProfile(resData.data)
      } else {
        throw new Error(resData?.error?.message || 'Failed to load user profile')
      }
    } catch (err) {
      console.error('Failed to sync auth user profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, getToken])

  const updateProfile = async (profileData) => {
    const token = await getToken()
    const response = await fetch('http://localhost:8080/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })

    const resData = await response.json()
    if (response.ok && resData.success) {
      setUserProfile(resData.data)
      return resData.data
    } else {
      throw new Error(resData?.error?.message || 'Failed to update profile')
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  const role = userProfile?.role || 'PENDING'
  const isPending = role === 'PENDING' || userProfile?.status === 'PENDING_APPROVAL'
  const isAdmin = role === 'ADMIN'
  const isPrincipal = role === 'PRINCIPAL'
  const isTeacher = role === 'TEACHER'
  const isFinance = role === 'FINANCE_STAFF'

  // Check if staff profile has all mandatory identification fields (valid NIC format, 10-digit phone, address, name, real email)
  const isProfileComplete = Boolean(
    userProfile?.nicNumber && /^([0-9]{12}|[0-9]{9}[V])$/i.test(userProfile.nicNumber.trim()) &&
    userProfile?.phoneNumber && /^[0-9]{10}$/.test(userProfile.phoneNumber.trim()) &&
    userProfile?.address && userProfile.address.trim() !== '' &&
    userProfile?.firstName && userProfile.firstName.trim() !== '' &&
    userProfile?.lastName && userProfile.lastName.trim() !== '' &&
    userProfile?.email && !userProfile.email.endsWith('@placeholder.com')
  )

  const value = {
    userProfile,
    role,
    isPending,
    isAdmin,
    isPrincipal,
    isTeacher,
    isFinance,
    isProfileComplete,
    loading,
    error,
    refreshUser: fetchUserProfile,
    updateProfile,
    getToken
  }

  return (
    <AuthUserContext.Provider value={value}>
      {children}
    </AuthUserContext.Provider>
  )
}

export function useAuthUser() {
  const context = useContext(AuthUserContext)
  if (!context) {
    throw new Error('useAuthUser must be used within an AuthUserProvider')
  }
  return context
}
