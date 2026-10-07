import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CalendarPlus,
  ClipboardList,
  Edit3,
  GraduationCap,
  School,
  Shield,
  Sparkles,
  Users,
} from "lucide-react"
import { useAuthUser } from "@/context/AuthUserContext"
import { useDisplayName } from "@/hooks/useDisplayName"
import { useStaggerIn } from "@/hooks/useMotion"
import { getAllowedModules, ROLE_LABELS } from "@/lib/modules"
import { Link } from "@/lib/router"
import { PORTAL_NAME } from "@/lib/branding"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { StatTile } from "@/components/ui/stat-tile"
import { Badge } from "@/components/ui/badge"

const QUICK_ACTIONS = {
  TEACHER: [
    { to: "/academics/marks", icon: Edit3, label: "Enter marks", hint: "Record scores for your classes" },
    { to: "/timetable/teachers", icon: Calendar, label: "My schedule", hint: "This week's periods and rooms" },
    { to: "/academics/report-cards", icon: Award, label: "Report cards", hint: "Term reports and rankings" },
  ],
  ADMIN: [
    { to: "/academics/exams", icon: CalendarPlus, label: "Schedule an exam", hint: "Create term exam timetables" },
    { to: "/timetable/classes", icon: Calendar, label: "Class timetables", hint: "Assign and review periods" },
    { to: "/staff", icon: Shield, label: "Review staff", hint: "Approve roles and accounts" },
  ],
  PRINCIPAL: [
    { to: "/academics/exams", icon: ClipboardList, label: "Browse exams", hint: "All classes and terms" },
    { to: "/academics/marks", icon: BookOpen, label: "Student marks", hint: "Scores and grades by class" },
    { to: "/staff", icon: Users, label: "Staff directory", hint: "Contacts, roles and status" },
  ],
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export default function OverviewPage() {
  const { role, isPrincipal } = useAuthUser()
  const { displayName } = useDisplayName()
  const modules = getAllowedModules(role, { isPrincipal })
  const actions = QUICK_ACTIONS[role] || []
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })

  const actionsRef = useStaggerIn("[data-animate]", [role])
  const gridRef = useStaggerIn("[data-animate]", [role], { delay: 0.08 })

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={today}
        title={`${greeting()}, ${displayName}`}
        description={`${PORTAL_NAME} · Signed in as ${ROLE_LABELS[role] || role}`}
      />

      {actions.length > 0 ? (
        <section aria-labelledby="quick-actions" className="space-y-3">
          <h2 id="quick-actions" className="text-section text-foreground">
            Quick actions
          </h2>
          <div ref={actionsRef} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {actions.map(({ to, icon: Icon, label, hint }) => (
              <Link
                key={to}
                to={to}
                data-animate
                className="group flex items-center gap-3.5 rounded-[12px] border border-border bg-surface p-4 shadow-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent-blue/40 hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent-blue-soft text-accent-blue transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{hint}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="flex items-start gap-3 rounded-[12px] border border-accent-blue/25 bg-accent-blue-soft p-4 text-[13px]">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
          <div>
            <div className="font-medium text-foreground">Your tools are on the way</div>
            <p className="text-foreground-2">
              The finance ledger and support tickets are being built. You'll find them in the sidebar as soon as they go live.
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="school-stats" className="space-y-3">
        <h2 id="school-stats" className="text-section text-foreground">
          School at a glance
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile icon={Users} label="Enrolled students" value={1387} tone="blue" />
          <StatTile icon={GraduationCap} label="Teaching faculty" value={62} tone="blue" />
          <StatTile icon={School} label="Classes (Grades 1–13)" value={39} tone="green" />
          <StatTile icon={Calendar} label="Halls · Buildings E–G" value={45} tone="neutral" />
        </div>
      </section>

      <section aria-labelledby="modules" className="space-y-3">
        <div>
          <h2 id="modules" className="text-section text-foreground">
            Your modules
          </h2>
          <p className="text-[13px] text-muted-foreground">What your role can open today, and what's coming next.</p>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                key={mod.id}
                to={mod.path}
                data-animate
                className={cn(
                  "group flex flex-col rounded-[12px] border border-border bg-surface p-5 shadow-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-pop focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !mod.live && "bg-surface/60"
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-[10px]",
                      mod.live ? "bg-accent-blue-soft text-accent-blue" : "bg-surface-2 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  {mod.live ? (
                    <Badge variant="outline">{mod.count}</Badge>
                  ) : (
                    <Badge variant="secondary">Coming soon</Badge>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{mod.name}</h3>
                <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted-foreground">{mod.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-[13px] font-medium">
                  {mod.live ? (
                    <span className="flex items-center gap-1 text-accent-blue">
                      {mod.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground">
                      See what's planned
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
