import * as React from "react"
import { cn } from "@/lib/utils"

// Shared field look for Input and Textarea (and anything else that wants to match them).
export const fieldClasses =
  "w-full rounded-[10px] border border-border-strong bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/80 transition-[border-color,box-shadow,background-color] duration-150 hover:border-accent-blue/40 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-danger/15"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn("flex h-9 py-1.5", fieldClasses, className)}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
