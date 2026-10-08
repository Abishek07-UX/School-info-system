import { Fragment } from "react"
import { ChevronRight, Menu } from "lucide-react"
import { useAuthUser } from "@/context/AuthUserContext"
import { getBreadcrumbs } from "@/lib/navigation"
import { Link, useLocation } from "@/lib/router"
import { ROLE_LABELS } from "@/lib/modules"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "./UserMenu"

export function Topbar({ onOpenMenu, onOpenProfile }) {
  const { pathname } = useLocation()
  const { role, isPrincipal, isTeacher } = useAuthUser()
  const crumbs = getBreadcrumbs(pathname, { isPrincipal, isTeacher })

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open navigation"
        className="-ml-1.5 inline-flex h-9 w-9 items-center justify-center rounded-[9px] text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground md:hidden cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-1.5 text-[13px]">
          {crumbs.map((crumb, i) => (
            <Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
              <li className={i < crumbs.length - 1 ? "hidden shrink-0 sm:block" : "min-w-0 truncate"}>
                {crumb.to ? (
                  <Link to={crumb.to} className="text-muted-foreground transition-colors hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="font-medium text-foreground">
                    {crumb.label}
                  </span>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary" className="hidden lg:inline-flex">
          {ROLE_LABELS[role] || role}
        </Badge>
        <UserMenu onOpenProfile={onOpenProfile} />
      </div>
    </header>
  )
}
