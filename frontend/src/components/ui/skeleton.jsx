import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-800/60 border border-white/5", className)}
      {...props}
    />
  )
}

export { Skeleton }
