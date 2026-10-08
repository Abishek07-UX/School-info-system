import { cn } from "@/lib/utils"
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator"

/**
 * Single-choice pill group with a sliding highlight.
 * options: [{ value, label, icon? }]
 * Renders as role="group" with aria-pressed buttons, labelled by `label`.
 */
export function SegmentedControl({ value, onChange, options, label, size = "default", className }) {
  const [containerRef, indicatorStyle] = useSlidingIndicator('[aria-pressed="true"]', [value])

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={label}
      className={cn(
        "relative isolate inline-flex items-center rounded-[11px] bg-surface-2 p-1",
        size === "sm" ? "h-9" : "h-10",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[8px] bg-surface shadow-card dark:bg-surface-hover"
        style={indicatorStyle}
      />
      {options.map((option) => {
        const active = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-full flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] px-3 text-[13px] font-medium transition-colors duration-150 cursor-pointer",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
