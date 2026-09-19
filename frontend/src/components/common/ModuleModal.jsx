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
      case "students": return <Users className="h-5 w-5 text-[#3b82f6]" />
      case "teachers": return <GraduationCap className="h-5 w-5 text-[#3b82f6]" />
      case "attendance": return <CalendarCheck className="h-5 w-5 text-[#4ade80]" />
      case "academics": return <BookOpen className="h-5 w-5 text-[#60a5fa]" />
      case "finance": return <CreditCard className="h-5 w-5 text-[#cececf]" />
      case "tickets": return <Ticket className="h-5 w-5 text-[#cececf]" />
      default: return <BookOpen className="h-5 w-5 text-[#3b82f6]" />
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
      "Direct assignment to Administrator or Principal with status updates",
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
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] border-[0.5px] border-white/10">
              {getModuleIcon(module.id)}
            </div>
            <div>
              <DialogTitle className="text-lg font-normal text-white">
                {module.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="default" className="text-[10px] font-normal">
                  {module.count}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-normal">
                  Roles: {module.roles.join(", ")}
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-[#858687] text-xs">
            {module.desc}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="rounded-[10px] border-[0.5px] border-white/10 bg-[#1f1f21] p-4">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-[#858687] mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#3b82f6]" />
              Module Capabilities & Specifications
            </h4>
            <div className="space-y-2.5">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#cececf]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4ade80] shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} className="text-xs">
            Close
          </Button>
          {module.id === "academics" ? (
            <Button
              onClick={() => {
                onClose()
                if (onNavigate) onNavigate("academics")
              }}
              className="gap-1.5 text-xs"
            >
              Open Academics Hub <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : module.id === "admin" ? (
            <Button
              onClick={() => {
                onClose()
                if (onNavigate) onNavigate("admin")
              }}
              className="gap-1.5 text-xs"
            >
              Open User Management <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
              className="text-xs text-[#cececf]"
            >
              Module Ready in System
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
