import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-[10px] border-[0.5px] p-4 text-xs [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-[#ffffff] [&>svg~*]:pl-7 transition-all",
  {
    variants: {
      variant: {
        default: "bg-[#131416] border-white/10 text-[#cececf]",
        destructive:
          "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171] [&>svg]:text-[#f87171]",
        success:
          "border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80] [&>svg]:text-[#4ade80]",
        warning:
          "border-[#ea580c]/30 bg-[#ea580c]/10 text-[#ea580c] [&>svg]:text-[#ea580c]",
        info:
          "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#60a5fa] [&>svg]:text-[#3b82f6]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight text-[#ffffff]", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs text-[#858687] [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
