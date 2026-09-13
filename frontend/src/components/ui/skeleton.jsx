import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-[8px] bg-[#1f1f21] border-[0.5px] border-white/5", className)}
      {...props}
    />
  )
}

export { Skeleton }
