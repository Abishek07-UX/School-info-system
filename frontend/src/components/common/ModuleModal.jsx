import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Ticket,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react"

export default function ModuleModal({ module, isOpen, onClose, onNavigate }) {
  if (!module) return null

  const getModuleIcon = (id) => {
    switch (id) {
      case "students": return <Users className="h-6 w-6 text-indigo-400" />
      case "teachers": return <GraduationCap className="h-6 w-6 text-purple-400" />
      case "attendance": return <CalendarCheck className="h-6 w-6 text-emerald-400" />
      case "academics": return <BookOpen className="h-6 w-6 text-sky-400" />
      case "finance": return <CreditCard className="h-6 w-6 text-amber-400" />
      case "tickets": return <Ticket className="h-6 w-6 text-pink-400" />
      default: return <BookOpen className="h-6 w-6 text-indigo-400" />
    }
  }

  const moduleFeatures = {
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
      "Direct assignment to Administrator or Principal with status updates (Open, In Progress, Resolved)",
      "Audit trail of staff communication and resolution timelines",
    ],
  }

  const features = moduleFeatures[module.id] || [
    "Integrated database synchronization with school management backend",
    "Role-based access control safeguarding sensitive student and staff data",
    "Real-time audit logging and administrative oversight",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 border border-white/10 shadow-md">
              {getModuleIcon(module.id)}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-heading">
                {module.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs text-indigo-300 border-indigo-500/30">
                  {module.count}
                </Badge>
                <Badge variant="secondary" className="text-[11px]">
                  Roles: {module.roles.join(", ")}
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-slate-300 text-sm">
            {module.desc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              Module Capabilities & Specifications
            </h4>
            <div className="space-y-2.5">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {module.id === "academics" ? (
            <Button
              onClick={() => {
                onClose()
                if (onNavigate) onNavigate("academics")
              }}
              className="gap-1.5"
            >
              Open Academics Hub <ArrowRight className="h-4 w-4" />
            </Button>
          ) : module.id === "admin" ? (
            <Button
              onClick={() => {
                onClose()
                if (onNavigate) onNavigate("admin")
              }}
              className="gap-1.5"
            >
              Open User Management <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
              className="border-indigo-500/30 text-indigo-300"
            >
              Module Ready in System
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
