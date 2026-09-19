import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-normal ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.99] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#f2f2f2] text-[#333333] hover:bg-white shadow-[0_1px_4px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)] border-none",
        secondary:
          "bg-white/[0.05] text-[#ffffff] hover:bg-white/[0.08] border-none",
        outline:
          "border-[0.5px] border-white/10 bg-[#131416] text-[#cececf] hover:text-white hover:border-white/20 hover:bg-[#1a1b1e]",
        ghost:
          "bg-transparent text-[#858687] hover:text-white hover:bg-white/[0.04] border-none",
        destructive:
          "bg-[#f87171]/10 text-[#f87171] border-[0.5px] border-[#f87171]/30 hover:bg-[#f87171]/20",
        link:
          "text-[#3b82f6] underline-offset-4 hover:underline hover:text-[#60a5fa] p-0 h-auto bg-transparent border-none",
        subtle:
          "bg-[#1f1f21] text-[#cececf] hover:text-white border-[0.5px] border-white/10 hover:border-white/15",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[8px] px-3 text-xs",
        lg: "h-11 rounded-[10px] px-6 text-sm",
        icon: "h-8 w-8 rounded-[8px]",
        xs: "h-7 rounded-[6px] px-2.5 text-xs",
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
