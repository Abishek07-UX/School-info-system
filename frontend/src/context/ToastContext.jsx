import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { CheckCircle2, AlertTriangle, Info, X, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion"

const ToastContext = createContext(null)

const DURATION = { success: 4000, info: 4000, warning: 6000, error: 6500 }

const TONE = {
  success: { icon: CheckCircle2, className: "text-success" },
  info: { icon: Info, className: "text-accent-blue" },
  warning: { icon: AlertTriangle, className: "text-warning" },
  error: { icon: XCircle, className: "text-danger" },
}

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
  }, [])

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback((type, message, options = {}) => {
    const id = nextId++
    setToasts((list) => [...list.slice(-3), { id, type, message, title: options.title, leaving: false }])
    return id
  }, [])

  const api = useMemo(
    () => ({
      success: (message, options) => show("success", message, options),
      error: (message, options) => show("error", message, options),
      info: (message, options) => show("info", message, options),
      warning: (message, options) => show("warning", message, options),
      dismiss,
    }),
    [show, dismiss]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-14 z-[60] flex flex-col items-center gap-2 p-3 sm:inset-x-auto sm:right-0 sm:items-end sm:p-5"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} onRemoved={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss, onRemoved }) {
  const ref = useRef(null)
  const timer = useRef(null)
  const { icon: Icon, className: toneClass } = TONE[toast.type] || TONE.info

  const startTimer = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onDismiss(toast.id), DURATION[toast.type] || 4000)
  }, [onDismiss, toast.id, toast.type])

  const stopTimer = () => clearTimeout(timer.current)

  // Enter
  useGSAP(() => {
    startTimer()
    if (!prefersReducedMotion()) {
      gsap.fromTo(ref.current, { opacity: 0, y: -12, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.3 })
    }
    return () => clearTimeout(timer.current)
  }, [])

  // Exit
  useGSAP(() => {
    if (!toast.leaving) return
    if (prefersReducedMotion()) {
      onRemoved(toast.id)
      return
    }
    gsap.to(ref.current, {
      opacity: 0,
      x: 24,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => onRemoved(toast.id),
    })
  }, [toast.leaving])

  return (
    <div
      ref={ref}
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
      onFocus={stopTimer}
      onBlur={startTimer}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[12px] border border-border bg-surface p-3.5 pr-2.5 text-[13px] text-foreground shadow-pop"
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneClass)} aria-hidden />
      <div className="min-w-0 flex-1 leading-snug">
        {toast.title && <div className="mb-0.5 font-semibold">{toast.title}</div>}
        <div className={cn(toast.title && "text-foreground-2")}>{toast.message}</div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-my-1 rounded-[7px] p-1 text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}
