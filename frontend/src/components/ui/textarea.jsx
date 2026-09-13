import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-[10px] border-[0.5px] border-white/10 bg-[#1f1f21] px-3.5 py-2 text-xs text-[#ffffff] placeholder:text-[#9d9e9f] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6] focus-visible:border-[#3b82f6] disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
