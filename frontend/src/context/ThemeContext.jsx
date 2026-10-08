import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "theme"
const MODES = ["light", "dark", "system"]

const ThemeContext = createContext(null)

function readStoredMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return MODES.includes(stored) ? stored : "system"
  } catch {
    return "system"
  }
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyTheme(resolved, animate) {
  const root = document.documentElement
  if (animate) {
    root.classList.add("theme-transition")
    window.setTimeout(() => root.classList.remove("theme-transition"), 260)
  }
  root.classList.toggle("dark", resolved === "dark")
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readStoredMode)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  // Follow OS changes while in "system" mode
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (e) => setSystemDark(e.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme = mode === "system" ? (systemDark ? "dark" : "light") : mode

  useEffect(() => {
    applyTheme(resolvedTheme, false)
  }, [resolvedTheme])

  const setMode = useCallback((next) => {
    if (!MODES.includes(next)) return
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage can be unavailable (private mode); the choice still applies for this session
    }
    const nextResolved = next === "system" ? (systemPrefersDark() ? "dark" : "light") : next
    applyTheme(nextResolved, true)
    setModeState(next)
  }, [])

  const value = useMemo(() => ({ mode, resolvedTheme, setMode }), [mode, resolvedTheme, setMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
