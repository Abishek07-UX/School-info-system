import { ClerkProvider } from '@clerk/react'
import { useTheme } from '@/context/ThemeContext'

// Clerk renders its own sign-in modal, so give it the same palette as the active theme.
const clerkVariables = {
  light: {
    colorPrimary: '#1b1f27',
    colorBackground: '#f8f9fb',
    colorText: '#14171d',
    colorTextSecondary: '#5c6370',
    colorInputBackground: '#f8f9fb',
    colorInputText: '#14171d',
    colorNeutral: '#14171d',
    colorDanger: '#dc2626',
    colorSuccess: '#15803d',
    colorWarning: '#b45309',
    borderRadius: '10px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  dark: {
    colorPrimary: '#f2f2f2',
    colorBackground: '#131416',
    colorText: '#f5f5f6',
    colorTextSecondary: '#8d8e91',
    colorInputBackground: '#1c1d20',
    colorInputText: '#f5f5f6',
    colorNeutral: '#f5f5f6',
    colorDanger: '#f87171',
    colorSuccess: '#4ade80',
    colorWarning: '#fbbf24',
    borderRadius: '10px',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
}

export default function ThemedClerkProvider({ publishableKey, children }) {
  const { resolvedTheme } = useTheme()
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/"
      appearance={{ variables: clerkVariables[resolvedTheme] }}
    >
      {children}
    </ClerkProvider>
  )
}
