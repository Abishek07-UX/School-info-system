import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Your details", "Admin approval", "Portal access"]

/** Three-step progress for new staff: details → approval → access. `current` is 0-based. */
export function RegistrationSteps({ current = 0, className }) {
  return (
    <ol className={cn("flex items-center justify-center gap-2 text-xs", className)} aria-label="Registration progress">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                done && "border-success bg-success text-on-accent",
                active && "border-accent-blue bg-accent-blue-soft text-accent-blue",
                !done && !active && "border-border-strong text-muted-foreground"
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden sm:inline", active ? "font-medium text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span aria-hidden className={cn("h-px w-6 sm:w-10", done ? "bg-success" : "bg-border-strong")} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
