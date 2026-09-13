import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value = 0, indicatorColor = "bg-gradient-to-r from-indigo-500 to-purple-500", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80 border border-white/5",
      className
    )}
    {...props}
  >
    <div
      className={cn("h-full w-full flex-1 transition-all duration-300", indicatorColor)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
