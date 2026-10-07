import { createContext, useCallback, useContext, useRef, useState } from "react"
import { AlertTriangle, HelpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ConfirmContext = createContext(null)

/**
 * Promise-based replacement for window.confirm:
 *   const confirm = useConfirm()
 *   if (!(await confirm({ title, description, confirmLabel, tone: "danger" }))) return
 */
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolver.current = resolve
      setRequest({
        title: "Are you sure?",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        tone: "default",
        ...(typeof options === "string" ? { description: options } : options),
      })
    })
  }, [])

  const settle = (value) => {
    resolver.current?.(value)
    resolver.current = null
    setRequest(null)
  }

  const danger = request?.tone === "danger"
  const Icon = danger ? AlertTriangle : HelpCircle

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={Boolean(request)} onOpenChange={(open) => !open && settle(false)}>
        <DialogContent className="max-w-md" hideClose>
          <div className="flex gap-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                danger ? "bg-danger-soft text-danger" : "bg-accent-blue-soft text-accent-blue"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle className="text-section">{request?.title}</DialogTitle>
              {request?.description && <DialogDescription>{request.description}</DialogDescription>}
            </DialogHeader>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => settle(false)}>
              {request?.cancelLabel}
            </Button>
            <Button
              autoFocus
              onClick={() => settle(true)}
              className={cn(danger && "bg-danger text-white hover:bg-danger/90 dark:text-background")}
            >
              {request?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider")
  return ctx
}
