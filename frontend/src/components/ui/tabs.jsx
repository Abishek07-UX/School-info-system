import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-[10px] bg-[#131416] p-1 text-[#858687] border-[0.5px] border-white/[0.07]",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-[8px] px-3.5 py-1.5 text-xs font-normal text-[#858687] transition-all hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#1f1f21] data-[state=active]:text-white data-[state=active]:border-[0.5px] data-[state=active]:border-white/10 data-[state=active]:shadow-xs cursor-pointer",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#3b82f6]",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
