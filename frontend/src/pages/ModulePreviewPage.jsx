import { ArrowLeft, CheckCircle2, Clock } from "lucide-react"
import { useAuthUser } from "@/context/AuthUserContext"
import { getAllowedModules } from "@/lib/modules"
import { Link, Navigate, useParams } from "@/lib/router"
import { useStaggerIn } from "@/hooks/useMotion"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const FEATURES = {
  students: [
    "Search and filter through 1,387+ enrolled student profiles across Grades 1–13",
    "Record and edit student biodata, emergency guardian contacts, and admission numbers",
    "Track historical academic enrollment, promotion history, and section assignments",
    "Export student roster lists and generate enrollment verification certificates",
  ],
  teachers: [
    "Directory of 62 certified teaching faculty and subject department specialists",
    "Assign subject and class teacher responsibilities for each term",
    "View teacher schedule timetables and contact credentials",
    "Track teacher qualifications, appointment dates, and departmental headships",
  ],
  attendance: [
    "Daily single-click student attendance recording by appointed Class Teachers",
    "Historical monthly attendance percentage calculations and aggregate heatmaps",
    "Automated alerts for students with attendance dropping below the 80% threshold",
    "Teacher attendance and leave tracking for administrative accountability",
  ],
  finance: [
    "Comprehensive fee structure configuration across primary, secondary, and senior school",
    "Offline manual receipt logging for term fees, facility charges, and sports subscriptions",
    "Outstanding balance tracking with overdue reminder generation",
    "Term-end financial reconciliation and collection ledger summaries",
  ],
  tickets: [
    "Internal operational issue reporting for academic and administrative staff",
    "Categorized tracking for Data Correction, IT Support, Facilities, and Timetable queries",
    "Direct assignment to Administrator or Principal with status updates",
    "Audit trail of staff communication and resolution timelines",
  ],
}

/** Placeholder page for modules that aren't built yet: what they'll do and who gets them. */
export default function ModulePreviewPage() {
  const { id } = useParams()
  const { role, isPrincipal } = useAuthUser()
  const mod = getAllowedModules(role, { isPrincipal }).find((m) => m.id === id && !m.live)
  const listRef = useStaggerIn("li", [id])

  if (!mod) return <Navigate to="/" />
  const Icon = mod.icon

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        icon={Icon}
        title={mod.name}
        description={mod.desc}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Overview
            </Link>
          </Button>
        }
      >
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="warning" dot>
            In development
          </Badge>
          <Badge variant="secondary">For: {mod.roles.map((r) => r.replace("_", " ").toLowerCase()).join(", ")}</Badge>
        </div>
      </PageHeader>

      <div className="rounded-[12px] border border-border bg-surface p-5 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-section text-foreground">
          <Clock className="h-4 w-4 text-muted-foreground" />
          What this module will do
        </h2>
        <ul ref={listRef} className="space-y-3">
          {(FEATURES[mod.id] || []).map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-foreground-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
