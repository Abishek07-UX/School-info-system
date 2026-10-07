import { LayoutGrid, PanelLeftClose, PanelLeftOpen, School } from "lucide-react"
import { useAuthUser } from "@/context/AuthUserContext"
import { getAllowedModules } from "@/lib/modules"
import { NavLink, Link } from "@/lib/router"
import { SCHOOL_NAME } from "@/lib/branding"
import { cn } from "@/lib/utils"
import { useSlidingIndicator } from "@/hooks/useSlidingIndicator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/ui/theme-toggle"

function NavItem({ to, icon: Icon, label, collapsed, end, muted, badge, onNavigate }) {
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex h-9 items-center gap-3 rounded-[9px] px-2.5 text-[13.5px] font-medium transition-colors duration-150",
          isActive
            ? "text-foreground"
            : muted
              ? "text-muted-foreground/80 hover:bg-surface-hover/70 hover:text-foreground"
              : "text-muted-foreground hover:bg-surface-hover/70 hover:text-foreground",
          collapsed && "justify-center px-0"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors",
              isActive ? "text-accent-blue" : "text-muted-foreground group-hover:text-foreground"
            )}
          />
          <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
          {badge && !collapsed && (
            <span className="ml-auto rounded-[5px] bg-surface-2 px-1.5 py-px text-[10px] font-medium text-muted-foreground">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )

  if (!collapsed) return link
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{badge ? `${label} · ${badge}` : label}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Primary navigation. Lists the modules the signed-in role can use, with "coming soon"
 * modules underneath. `collapsed` shows icons only.
 */
export function Sidebar({ collapsed = false, onToggleCollapse, onNavigate, className }) {
  const { role, isPrincipal } = useAuthUser()
  const modules = getAllowedModules(role, { isPrincipal })
  const live = modules.filter((m) => m.live)
  const upcoming = modules.filter((m) => !m.live)
  const [navRef, indicatorStyle] = useSlidingIndicator('a[aria-current="page"]')

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Brand */}
      <Link
        to="/"
        onClick={onNavigate}
        className={cn(
          "flex h-14 shrink-0 items-center gap-2.5 rounded-[10px] px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          collapsed && "justify-center px-0"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
          <School className="h-4 w-4" />
        </span>
        <span className={cn("min-w-0 leading-tight", collapsed && "sr-only")}>
          <span className="block truncate text-sm font-semibold text-foreground">{SCHOOL_NAME}</span>
          <span className="block truncate text-[11px] text-muted-foreground">Staff Portal</span>
        </span>
      </Link>

      <nav aria-label="Main" className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
        <div ref={navRef} className="relative isolate space-y-0.5">
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 -z-10 rounded-[9px] bg-surface shadow-card dark:bg-surface-hover"
            style={indicatorStyle}
          />
          <NavItem to="/" end icon={LayoutGrid} label="Overview" collapsed={collapsed} onNavigate={onNavigate} />
          {live.map((mod) => (
            <NavItem
              key={mod.id}
              to={mod.path}
              icon={mod.icon}
              label={mod.navLabel}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}

          {upcoming.length > 0 && (
            <>
              <div
                className={cn(
                  "px-2.5 pb-1.5 pt-5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80",
                  collapsed && "sr-only"
                )}
              >
                Coming soon
              </div>
              {collapsed && <div aria-hidden className="mx-2 my-3 h-px bg-border" />}
              {upcoming.map((mod) => (
                <NavItem
                  key={mod.id}
                  to={mod.path}
                  icon={mod.icon}
                  label={mod.navLabel}
                  badge="Soon"
                  muted
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </>
          )}
        </div>
      </nav>

      <div className={cn("flex shrink-0 items-center gap-1 border-t border-border p-2", collapsed && "flex-col")}>
        <ThemeToggle showLabel={!collapsed} className={cn(!collapsed && "flex-1 justify-start")} />
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground cursor-pointer"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  )
}
