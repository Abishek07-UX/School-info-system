import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium select-none cursor-pointer transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-card hover:bg-primary/88",
        secondary:
          "bg-surface-2 text-foreground hover:bg-surface-hover",
        outline:
          "border border-border-strong bg-surface text-foreground-2 hover:text-foreground hover:bg-surface-hover",
        ghost:
          "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-hover",
        destructive:
          "bg-danger-soft text-danger border border-danger/30 hover:bg-danger/15",
        link:
          "h-auto p-0 bg-transparent text-accent-blue underline-offset-4 hover:underline active:scale-100",
        subtle:
          "bg-surface-2 text-foreground-2 border border-border hover:text-foreground hover:border-border-strong",
        accent:
          "bg-accent-blue-soft text-accent-blue hover:bg-accent-blue/15",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 rounded-[8px] px-3 text-[13px]",
        lg: "h-11 px-6 text-[15px]",
        icon: "h-9 w-9 rounded-[9px]",
        "icon-sm": "h-8 w-8 rounded-[8px]",
        xs: "h-7 rounded-[7px] px-2.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * `loading` keeps the button's width, swaps the icon for a spinner and blocks clicks.
 */
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    if (asChild) {
      return (
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Comp>
      )
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        )}
        <span className={cn("contents", loading && "[&>*]:invisible invisible")}>{children}</span>
      </Comp>
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
