import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:ring-rose-500",
        outline:
          "border border-white/10 bg-slate-900/60 backdrop-blur-md hover:bg-slate-800/80 hover:border-indigo-500/40 text-slate-200 hover:text-white",
        secondary:
          "bg-slate-800/90 text-slate-100 hover:bg-slate-700/90 border border-slate-700/60 shadow-sm",
        ghost:
          "hover:bg-slate-800/60 text-slate-300 hover:text-white",
        link:
          "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",
        glass:
          "bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:border-indigo-400/40 backdrop-blur-md",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9 rounded-lg",
        xs: "h-7 rounded-md px-2.5 text-xs font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
