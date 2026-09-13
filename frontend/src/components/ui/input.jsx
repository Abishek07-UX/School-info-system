import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-[10px] border-[0.5px] border-white/10 bg-[#1f1f21] px-3.5 py-1.5 text-xs text-[#ffffff] placeholder:text-[#9d9e9f] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6] focus-visible:border-[#3b82f6] disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
