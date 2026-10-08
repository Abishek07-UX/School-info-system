import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator"

const Tabs = TabsPrimitive.Root

const TabsVariantContext = React.createContext("segmented")

/**
 * variant="segmented" — pill on a tinted track (default)
 * variant="underline" — page-level section nav with a sliding underline
 */
const TabsList = React.forwardRef(({ className, variant = "segmented", children, ...props }, ref) => {
  const [containerRef, indicatorStyle, rect] = useSlidingIndicator('[role="tab"][data-state="active"]')
  const setRefs = (node) => {
    containerRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }

  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        ref={setRefs}
        className={cn(
          "relative isolate",
          variant === "segmented" &&
            "inline-flex h-10 items-center rounded-[11px] bg-surface-2 p-1 text-muted-foreground",
          variant === "underline" &&
            "flex w-full items-end gap-1 overflow-x-auto border-b border-border text-muted-foreground [scrollbar-width:none]",
          className
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 -z-10",
            variant === "segmented" && "top-0 rounded-[8px] bg-surface shadow-card dark:bg-surface-hover",
            variant === "underline" && "bottom-0 h-0.5 rounded-full bg-foreground"
          )}
          style={
            variant === "underline" && rect
              ? {
                  width: rect.width,
                  transform: `translateX(${rect.left}px)`,
                  transition: rect.animate ? indicatorStyle.transition : "none",
                }
              : indicatorStyle
          }
        />
        {children}
      </TabsPrimitive.List>
    </TabsVariantContext.Provider>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap text-[13px] font-medium transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
        variant === "segmented" &&
          "h-full rounded-[8px] px-3.5 hover:text-foreground data-[state=active]:text-foreground",
        variant === "underline" &&
          "h-11 rounded-t-[8px] px-3 hover:text-foreground data-[state=active]:text-foreground",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-4 focus-visible:outline-none data-[state=active]:animate-fade-in", className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
