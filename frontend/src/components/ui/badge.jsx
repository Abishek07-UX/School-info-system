import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
        secondary:
          "border-transparent bg-slate-800 text-slate-200 hover:bg-slate-700",
        destructive:
          "border-transparent bg-rose-600/20 text-rose-300 border-rose-500/30 hover:bg-rose-600/30",
        outline: "text-slate-300 border-slate-700 bg-slate-900/40",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25",
        warning:
          "border-amber-500/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25",
        info:
          "border-sky-500/30 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25",
        purple:
          "border-purple-500/30 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25",
        pink:
          "border-pink-500/30 bg-pink-500/15 text-pink-300 hover:bg-pink-500/25",
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
