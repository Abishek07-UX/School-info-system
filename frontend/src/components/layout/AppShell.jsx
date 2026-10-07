import { useEffect, useRef, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { useLocation } from "@/lib/router"
import { useGSAP, slideIn, fadeRise } from "@/lib/motion"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

const COLLAPSE_KEY = "sidebar-collapsed"

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1"
  } catch {
    return false
  }
}

function MobileDrawer({ open, onOpenChange }) {
  const panelRef = useRef(null)
  useGSAP(
    () => {
      if (open && panelRef.current) slideIn(panelRef.current, { from: "left" })
    },
    { dependencies: [open] }
  )

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-[2px] data-[state=open]:animate-fade-in md:hidden" />
        <DialogPrimitive.Content
          ref={panelRef}
          className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] border-r border-border bg-background shadow-pop focus:outline-none md:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Portal modules</DialogPrimitive.Description>
          <Sidebar onNavigate={() => onOpenChange(false)} />
          <DialogPrimitive.Close
            aria-label="Close navigation"
            className="absolute right-2 top-3 inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/**
 * Signed-in layout: sidebar (icons-only between md and lg, drawer below md), sticky
 * topbar with breadcrumb, and the routed page. Pages fade in when the module changes.
 */
export function AppShell({ children, onOpenProfile }) {
  const { pathname } = useLocation()
  const isWide = useMediaQuery("(min-width: 1024px)")
  const [userCollapsed, setUserCollapsed] = useState(readCollapsed)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const collapsed = !isWide || userCollapsed
  const section = pathname.split("/")[1] || "overview"
  const pageRef = useRef(null)

  useGSAP(
    () => {
      if (pageRef.current) fadeRise(pageRef.current, { y: 6, duration: 0.28 })
    },
    { dependencies: [section] }
  )

  // Leaving phone width (e.g. rotating a tablet) closes the drawer
  const isPhone = !useMediaQuery("(min-width: 768px)")
  useEffect(() => {
    if (!isPhone) setDrawerOpen(false)
  }, [isPhone])

  const toggleCollapsed = () => {
    setUserCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1")
      } catch {
        // ignore unavailable storage
      }
      return !value
    })
  }

  return (
    <TooltipProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-[8px] focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen w-full">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 border-r border-border bg-background transition-[width] duration-300 ease-out md:block",
            collapsed ? "w-[68px]" : "w-[248px]"
          )}
        >
          <Sidebar collapsed={collapsed} onToggleCollapse={isWide ? toggleCollapsed : undefined} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setDrawerOpen(true)} onOpenProfile={onOpenProfile} />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            <div key={section} ref={pageRef} className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </TooltipProvider>
  )
}
