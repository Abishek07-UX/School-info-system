import * as React from "react"
import { cn } from "@/lib/utils"
import { fieldClasses } from "./input"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn("flex min-h-[80px] py-2", fieldClasses, className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
