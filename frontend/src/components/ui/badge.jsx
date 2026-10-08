import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        default: "border-accent-blue/25 bg-accent-blue-soft text-accent-blue",
        secondary: "border-border bg-surface-2 text-foreground-2",
        destructive: "border-danger/25 bg-danger-soft text-danger",
        outline: "border-border-strong bg-transparent text-muted-foreground",
        success: "border-success/25 bg-success-soft text-success",
        warning: "border-warning/25 bg-warning-soft text-warning",
        info: "border-accent-blue/25 bg-accent-blue-soft text-accent-blue",
        // legacy aliases
        purple: "border-border bg-surface-2 text-foreground-2",
        pink: "border-border bg-surface-2 text-foreground-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * `dot` prefixes a small status dot in the badge's text color.
 */
function Badge({ className, variant, dot = false, children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
