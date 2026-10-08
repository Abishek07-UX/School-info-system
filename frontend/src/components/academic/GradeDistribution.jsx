import { useRef } from "react"
import { GRADE_FILL, GRADE_LABELS, GRADE_TEXT } from "@/lib/grades"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

const GRADES = ["A", "B", "C", "S", "F"]

/**
 * Stacked bar of how many students got each grade, with a legend underneath.
 * Segments grow in from the left whenever the distribution changes.
 */
export function GradeDistribution({ distribution = {}, total }) {
  const barRef = useRef(null)
  const sum = total || GRADES.reduce((acc, g) => acc + (distribution[g] || 0), 0)
  const key = GRADES.map((g) => distribution[g] || 0).join("-")

  useGSAP(
    () => {
      if (!barRef.current || prefersReducedMotion()) return
      gsap.from(barRef.current.children, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.6,
        stagger: 0.06,
        ease: "power3.out",
      })
    },
    { dependencies: [key], scope: barRef }
  )

  return (
    <div className="space-y-3">
      <div
        ref={barRef}
        className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-surface-2"
        role="img"
        aria-label={GRADES.map((g) => `${g}: ${distribution[g] || 0}`).join(", ")}
      >
        {GRADES.map((g) => {
          const count = distribution[g] || 0
          if (!count || !sum) return null
          return <div key={g} className={cn("h-full first:rounded-l-full last:rounded-r-full", GRADE_FILL[g])} style={{ width: `${(count / sum) * 100}%` }} />
        })}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {GRADES.map((g) => {
          const count = distribution[g] || 0
          const pct = sum > 0 ? Math.round((count / sum) * 100) : 0
          return (
            <div key={g} className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", GRADE_FILL[g])} />
                <span className={cn("text-xs font-semibold", GRADE_TEXT[g])}>{g}</span>
                <span className="hidden truncate text-[11px] text-muted-foreground sm:inline">{GRADE_LABELS[g]}</span>
              </div>
              <div className="tabular mt-0.5 text-lg font-semibold text-foreground">
                {count}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
