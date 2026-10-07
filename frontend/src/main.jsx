import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import ThemedClerkProvider from './components/common/ThemedClerkProvider'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const isValidKey = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('your_clerk')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      {isValidKey ? (
        <ThemedClerkProvider publishableKey={PUBLISHABLE_KEY}>
          <App isClerkConfigured={true} />
        </ThemedClerkProvider>
      ) : (
        <App isClerkConfigured={false} />
      )}
    </ThemeProvider>
  </StrictMode>,
)
