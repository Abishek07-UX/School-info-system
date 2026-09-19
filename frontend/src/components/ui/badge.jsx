import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[5.26px] border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#60a5fa]",
        secondary:
          "border-white/10 bg-[#1f1f21] text-[#cececf]",
        destructive:
          "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]",
        outline:
          "border-white/10 bg-transparent text-[#858687]",
        success:
          "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#4ade80]",
        warning:
          "border-[#ea580c]/30 bg-[#ea580c]/10 text-[#ea580c]",
        info:
          "border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#60a5fa]",
        purple:
          "border-white/15 bg-white/[0.04] text-[#cececf]",
        pink:
          "border-white/15 bg-white/[0.04] text-[#cececf]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
