import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7 backdrop-blur-md transition-all",
  {
    variants: {
      variant: {
        default: "bg-slate-900/80 border-white/10 text-slate-100",
        destructive:
          "border-rose-500/40 bg-rose-950/40 text-rose-200 [&>svg]:text-rose-400",
        success:
          "border-emerald-500/40 bg-emerald-950/40 text-emerald-200 [&>svg]:text-emerald-400",
        warning:
          "border-amber-500/40 bg-amber-950/40 text-amber-200 [&>svg]:text-amber-400",
        info:
          "border-sky-500/40 bg-sky-950/40 text-sky-200 [&>svg]:text-sky-400",
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
    className={cn("mb-1 font-semibold leading-none tracking-tight text-white", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs text-slate-300 [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
