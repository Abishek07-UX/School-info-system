import { cn } from "@/lib/utils"
import { useCountUp } from "@/hooks/useMotion"

const TONES = {
  blue: "bg-accent-blue-soft text-accent-blue",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
  neutral: "bg-surface-2 text-foreground-2",
}

/**
 * Compact metric tile. Numeric `value`s count up on first render; strings render as-is.
 * `suffix` is appended after the number (e.g. "%", " halls"); `decimals` keeps fractional digits.
 */
export function StatTile({ icon: Icon, label, value, suffix = "", decimals = 0, hint, tone = "blue", className }) {
  const isNumber = typeof value === "number"
  const format = (n) =>
    `${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  const ref = useCountUp(isNumber ? value : null, { format })

  return (
    <div className={cn("flex items-center gap-3.5 rounded-[12px] border border-border bg-surface p-4 shadow-card", className)}>
      {Icon && (
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]", TONES[tone] || TONES.blue)}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      )}
      <div className="min-w-0">
        <div ref={isNumber ? ref : undefined} className="tabular text-xl font-semibold tracking-tight text-foreground">
          {isNumber ? format(value) : value}
        </div>
        <div className="truncate text-xs text-muted-foreground">{label}</div>
        {hint && <div className="mt-0.5 truncate text-[11px] text-muted-foreground/80">{hint}</div>}
      </div>
    </div>
  )
}
