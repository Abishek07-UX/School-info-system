import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("skeleton-shimmer animate-shimmer rounded-[8px]", className)}
      {...props}
    />
  )
}

export { Skeleton }
