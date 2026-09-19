import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value = 0, indicatorColor = "bg-[#3b82f6]", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-1.5 w-full overflow-hidden rounded-full bg-[#1f1f21] border-[0.5px] border-white/5",
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
