import { cn } from "@/lib/utils"
import { GRADE_LABELS, GRADE_TONES } from "@/lib/grades"

/** Letter grade chip; `showLabel` adds the word ("A · Distinction"). */
export function GradeBadge({ grade, showLabel = true, className }) {
  if (!grade) return <span className="text-muted-foreground">—</span>
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold leading-4",
        GRADE_TONES[grade] || GRADE_TONES.F,
        className
      )}
    >
      {grade}
      {showLabel && GRADE_LABELS[grade] && <span className="font-medium opacity-90">({GRADE_LABELS[grade]})</span>}
    </span>
  )
}
