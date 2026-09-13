import { useState } from "react"
import { Show, SignInButton, useUser } from "@clerk/react"
import { AuthUserProvider, useAuthUser } from "./context/AuthUserContext"
import Navbar from "./components/common/Navbar"
import OnboardingView from "./components/OnboardingView"
import PendingApprovalView from "./components/PendingApprovalView"
import UserRoleManagement from "./components/admin/UserRoleManagement"
import StaffProfileModal from "./components/StaffProfileModal"
import AcademicDashboard from "./components/academic/AcademicDashboard"
import { TimetableHub } from "./components/timetable/TimetableHub"
import ModuleModal from "./components/common/ModuleModal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  CreditCard,
  Shield,
  Ticket,
  School,
  ArrowRight,
  User,
  AlertTriangle,
  Layers,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react"

function DashboardView({ onOpenProfile }) {
  const { user } = useUser()
  const { userProfile, role, isAdmin, isPrincipal, getToken, loading } = useAuthUser()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPreviewModule, setSelectedPreviewModule] = useState(null)

  const allModules = [
    {
      id: "timetable",
      name: "Timetable & Schedules",
      icon: Calendar,
      count: "39 Classes / 8 Periods",
      desc: "Conflict-free weekly class timetables, faculty routing schedules with Buildings E/F/G, and exam date sheets.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "academics",
      name: "Academics & Exams",
      icon: BookOpen,
      count: "351 Term Exams",
      desc: "3-term exam scheduling, batch numerical marks recording, automated letter grade conversion & report cards.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "students",
      name: "Student Management",
      icon: Users,
      count: "1,387 Enrolled",
      desc: "Register students, manage biographical profiles, guardian contacts & academic history across Grades 1–13.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "teachers",
      name: "Teacher Management",
      icon: GraduationCap,
      count: "62 Faculty",
      desc: "Teacher profiles, department specializations, and subject-class assignments for all 3 terms.",
      roles: ["ADMIN", "PRINCIPAL"],
    },
    {
      id: "attendance",
      name: "Attendance Tracking",
      icon: CalendarCheck,
      count: "96.4% Compliance",
      desc: "Daily student & teacher attendance recording with monthly heatmaps and 80% threshold alerts.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "finance",
      name: "Finance & Fee Ledger",
      icon: CreditCard,
      count: "Offline Receipts",
      desc: "Fee structure configuration, manual offline receipt recording, and overdue balance tracking.",
      roles: ["ADMIN", "PRINCIPAL", "FINANCE_STAFF"],
    },
    {
      id: "admin",
      name: "User & Role Administration",
      icon: Shield,
      count: "Access Control",
      desc: "User management, NIC verification, status toggling, and role permissions assignment.",
      roles: ["ADMIN", "PRINCIPAL"],
    },
    {
      id: "tickets",
      name: "Support Tickets",
      icon: Ticket,
      count: "Operational Logs",
      desc: "Internal staff operational issue reporting, assignment, and resolution tracking.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER", "FINANCE_STAFF"],
    },
  ]

  const allowedModules = allModules.filter((mod) => mod.roles.includes(role))

  const displayName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
    : user?.firstName || "Staff Member"

  const getRoleBadge = (r) => {
    switch (r) {
      case "ADMIN":
        return (
          <Badge variant="default" className="gap-1 font-normal">
            <Shield className="h-3 w-3 text-[#60a5fa]" /> Administrator
          </Badge>
        )
      case "PRINCIPAL":
        return (
          <Badge variant="default" className="gap-1 font-normal">
            <GraduationCap className="h-3 w-3 text-[#60a5fa]" /> Principal
          </Badge>
        )
      case "TEACHER":
        return (
          <Badge variant="secondary" className="gap-1 font-normal">
            <Users className="h-3 w-3 text-[#858687]" /> Teaching Faculty
          </Badge>
        )
      case "FINANCE_STAFF":
        return (
          <Badge variant="success" className="gap-1 font-normal">
            <CreditCard className="h-3 w-3 text-[#4ade80]" /> Finance Staff
          </Badge>
        )
      default:
        return (
          <Badge variant="warning" className="gap-1 font-normal">
            <Clock className="h-3 w-3 text-[#ea580c]" /> Pending Approval
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#858687]">
        <div className="h-8 w-8 animate-spin rounded-full border-[0.5px] border-[#3b82f6] border-t-transparent mb-4" />
        <div className="text-xs font-normal">Loading staff credentials and permissions...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b-[0.5px] border-white/[0.07] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#ffffff]">
              Welcome back, {displayName}
            </h1>
            {getRoleBadge(role)}
          </div>
          <p className="text-xs text-[#858687]">
            Vidyalaya School Information System &bull; Academic Operations Portal
          </p>
        </div>

        {/* Action Bar Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenProfile}
            className="gap-1.5 text-xs"
          >
            <User className="h-3.5 w-3.5 text-[#3b82f6]" />
            My Profile
          </Button>

          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="gap-1.5 text-xs"
          >
            <Layers className="h-3.5 w-3.5" />
            Overview
          </Button>

          <Button
            variant={activeTab === "timetable" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("timetable")}
            className="gap-1.5 text-xs"
          >
            <Calendar className="h-3.5 w-3.5 text-[#3b82f6]" />
            Timetable
          </Button>

          <Button
            variant={activeTab === "academics" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("academics")}
            className="gap-1.5 text-xs"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Academics
          </Button>

          {(isAdmin || isPrincipal) && (
            <Button
              variant={activeTab === "admin" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("admin")}
              className="gap-1.5 text-xs"
            >
              <Shield className="h-3.5 w-3.5 text-[#858687]" />
              Staff Accounts
            </Button>
          )}
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === "timetable" ? (
        <div className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="gap-1.5 text-xs"
          >
            ← Back to Overview
          </Button>
          <TimetableHub userRole={role} getToken={getToken} />
        </div>
      ) : activeTab === "academics" ? (
        <AcademicDashboard onBack={() => setActiveTab("overview")} />
      ) : activeTab === "admin" && (isAdmin || isPrincipal) ? (
        <div className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="gap-1.5 text-xs"
          >
            ← Back to Overview
          </Button>
          <UserRoleManagement />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-5 flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#3b82f6] border-[0.5px] border-white/10">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-normal text-[#ffffff] tracking-tight">1,387</div>
                <div className="text-[11px] text-[#858687]">Enrolled Students</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#3b82f6] border-[0.5px] border-white/10">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-normal text-[#ffffff] tracking-tight">62</div>
                <div className="text-[11px] text-[#858687]">Teaching Faculty</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#4ade80] border-[0.5px] border-white/10">
                <School className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-normal text-[#ffffff] tracking-tight">39</div>
                <div className="text-[11px] text-[#858687]">Classes (1–13)</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#60a5fa] border-[0.5px] border-white/10">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-normal text-[#ffffff] tracking-tight">45 Halls</div>
                <div className="text-[11px] text-[#858687]">Buildings E, F, G</div>
              </div>
            </Card>
          </div>

          {/* Module Selector & Navigation Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-normal tracking-tight text-[#ffffff]">
                  Accessible Operational Modules
                </h2>
                <p className="text-xs text-[#858687]">
                  Authorized for assigned role: <span className="text-[#ffffff]">{role}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allowedModules.map((mod) => {
                const Icon = mod.icon
                const isTimetable = mod.id === "timetable"
                const isAcademics = mod.id === "academics"
                const isAdminModule = mod.id === "admin" && (isAdmin || isPrincipal)

                return (
                  <Card
                    key={mod.id}
                    onClick={() => {
                      if (isTimetable) {
                        setActiveTab("timetable")
                      } else if (isAcademics) {
                        setActiveTab("academics")
                      } else if (isAdminModule) {
                        setActiveTab("admin")
                      } else {
                        setSelectedPreviewModule(mod)
                      }
                    }}
                    className="p-6 cursor-pointer hover:border-white/20 transition-all group relative"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#3b82f6] border-[0.5px] border-white/10 group-hover:border-[#3b82f6]/40 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-normal text-[#858687]">
                        {mod.count}
                      </Badge>
                    </div>

                    <h3 className="text-sm font-normal text-[#ffffff] group-hover:text-[#ffffff] transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-[#858687] mt-1.5 leading-relaxed">
                      {mod.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t-[0.5px] border-white/[0.05] flex items-center justify-between text-xs">
                      {isTimetable ? (
                        <span className="text-[#3b82f6] flex items-center gap-1">
                          Open Timetable Engine <ArrowRight className="h-3 w-3" />
                        </span>
                      ) : isAcademics ? (
                        <span className="text-[#60a5fa] flex items-center gap-1">
                          Open Evaluation Hub <ArrowRight className="h-3 w-3" />
                        </span>
                      ) : isAdminModule ? (
                        <span className="text-[#cececf] flex items-center gap-1">
                          Manage Staff Accounts <ArrowRight className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-[#858687] flex items-center gap-1 group-hover:text-[#ffffff]">
                          View Specifications <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Module Specs Preview Modal */}
      <ModuleModal
        module={selectedPreviewModule}
        isOpen={Boolean(selectedPreviewModule)}
        onClose={() => setSelectedPreviewModule(null)}
        onNavigate={(tab) => setActiveTab(tab)}
      />
    </div>
  )
}

function AuthenticatedPortal({ onOpenProfile }) {
  const { isProfileComplete, isPending, loading } = useAuthUser()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-[#858687]">
        <div className="h-8 w-8 animate-spin rounded-full border-[0.5px] border-[#3b82f6] border-t-transparent mb-4" />
        <div className="text-xs font-normal">Loading staff account permissions...</div>
      </div>
    )
  }

  // Step 1: Complete mandatory profile details
  if (!isProfileComplete) {
    return <OnboardingView />
  }

  // Step 2: Once details exist, if role is PENDING, show Pending Approval waiting screen
  if (isPending) {
    return <PendingApprovalView onEditProfile={onOpenProfile} />
  }

  // Step 3: Approved user enters full dashboard
  return <DashboardView onOpenProfile={onOpenProfile} />
}

function LandingView({ isClerkConfigured }) {
  return (
    <div className="mx-auto max-w-[1080px] px-4 py-16 sm:px-6 space-y-20">
      {/* Notice if Clerk not configured */}
      {!isClerkConfigured && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4 text-[#ea580c]" />
          <AlertTitle>Clerk Authentication Notice</AlertTitle>
          <AlertDescription>
            Copy <code>.env.example</code> to <code>.env</code> inside the <code>frontend/</code> directory and configure your <code>VITE_CLERK_PUBLISHABLE_KEY</code> for live staff sign-in.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section — 2-column split with whisper-weight headline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-normal tracking-[-1.3px] text-[#ffffff] leading-[1.05]">
            Unified academic and administrative operations.
          </h1>

          <p className="text-base sm:text-[18px] text-[#858687] leading-relaxed tracking-[-0.61px] max-w-xl">
            Centralized infrastructure for school administrators and faculty: conflict-free weekly timetables, classroom routing, attendance, 3-term numerical mark entry, and offline fee reconciliation.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isClerkConfigured ? (
              <SignInButton mode="modal">
                <Button size="lg" className="gap-2 text-sm px-6">
                  <Lock className="h-4 w-4" /> Sign In to Staff Portal
                </Button>
              </SignInButton>
            ) : (
              <Button
                size="lg"
                onClick={() =>
                  alert("Add VITE_CLERK_PUBLISHABLE_KEY in frontend/.env to enable live sign-in.")
                }
                className="gap-2 text-sm px-6"
              >
                <Lock className="h-4 w-4" /> Sign In Demo Mode
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const el = document.getElementById("infrastructure-specs")
                if (el) el.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-sm px-5"
            >
              Explore Infrastructure
            </Button>
          </div>
        </div>

        {/* Hero Product Mockup Panel with live status indicator */}
        <div className="lg:col-span-5">
          <div className="rounded-[12px] border-[0.5px] border-white/10 bg-[#131416] p-5 shadow-[0_20px_44px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b-[0.5px] border-white/[0.07] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4ade80]" />
                <span className="text-xs font-normal text-[#ffffff]">Academic Engine Active</span>
              </div>
              <Badge variant="success" className="text-[10px] py-0 px-2">
                Live 2026 Term
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-[8px] border-[0.5px] border-white/5 bg-[#1f1f21] p-3 flex items-center justify-between">
                <div>
                  <div className="text-[#ffffff]">Grade 10-A Timetable</div>
                  <div className="text-[11px] text-[#858687]">40-min periods &bull; Hall E-204</div>
                </div>
                <span className="text-[#4ade80] text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Conflict-Free
                </span>
              </div>

              <div className="rounded-[8px] border-[0.5px] border-white/5 bg-[#1f1f21] p-3 flex items-center justify-between">
                <div>
                  <div className="text-[#ffffff]">Grade 11 Mathematics Term 1</div>
                  <div className="text-[11px] text-[#858687]">42 Student Records Graded</div>
                </div>
                <span className="text-[#60a5fa] text-[11px]">Letter Calc Done</span>
              </div>

              <div className="rounded-[8px] border-[0.5px] border-white/5 bg-[#1f1f21] p-3 flex items-center justify-between">
                <div>
                  <div className="text-[#ffffff]">Daily Faculty Attendance</div>
                  <div className="text-[11px] text-[#858687]">62/62 Verified on Campus</div>
                </div>
                <span className="text-[#4ade80] text-[11px]">100% Present</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monochrome Stats Strip — Floating row without card container per design.md */}
      <div className="border-y-[0.5px] border-white/[0.07] py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
          <div>
            <div className="text-3xl font-normal text-[#ffffff] tracking-tight">1,387</div>
            <div className="text-xs text-[#858687] mt-1">Enrolled Students</div>
          </div>
          <div>
            <div className="text-3xl font-normal text-[#ffffff] tracking-tight">62</div>
            <div className="text-xs text-[#858687] mt-1">Teaching Faculty</div>
          </div>
          <div>
            <div className="text-3xl font-normal text-[#ffffff] tracking-tight">39</div>
            <div className="text-xs text-[#858687] mt-1">Grade 1–13 Classes</div>
          </div>
          <div>
            <div className="text-3xl font-normal text-[#ffffff] tracking-tight">45</div>
            <div className="text-xs text-[#858687] mt-1">Halls in Buildings E, F, G</div>
          </div>
        </div>
      </div>

      {/* Feature Showcase Grid — 0.5px hairline cards */}
      <div id="infrastructure-specs" className="space-y-6">
        <h2 className="text-2xl font-normal tracking-tight text-[#ffffff]">
          Core Operational Systems
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#3b82f6] border-[0.5px] border-white/10">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-normal text-[#ffffff]">Conflict-Free Timetables</h3>
            <p className="text-xs text-[#858687] leading-relaxed">
              40-minute periods, 07:50 AM start, interval breaks, classroom routing across Buildings E, F, G, and complete clash prevention.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#4ade80] border-[0.5px] border-white/10">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-normal text-[#ffffff]">Attendance Tracking</h3>
            <p className="text-xs text-[#858687] leading-relaxed">
              Fast daily student & teacher attendance recording with monthly compliance reports and 80% threshold notifications.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#60a5fa] border-[0.5px] border-white/10">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-normal text-[#ffffff]">Exams & Grading</h3>
            <p className="text-xs text-[#858687] leading-relaxed">
              Numerical mark recording with automated letter grade conversion, ranking summaries, and printable report cards.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#1f1f21] text-[#cececf] border-[0.5px] border-white/10">
              <CreditCard className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-normal text-[#ffffff]">Finance Ledger</h3>
            <p className="text-xs text-[#858687] leading-relaxed">
              Fee structure setup, offline collection receipt logging, and term-end balance tracking.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MainApp({ isClerkConfigured = true }) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0c0e] text-[#cececf]">
      <Navbar
        isClerkConfigured={isClerkConfigured}
        onOpenProfile={() => setShowProfileModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1">
        {isClerkConfigured ? (
          <>
            <Show when="signed-in">
              <AuthenticatedPortal onOpenProfile={() => setShowProfileModal(true)} />
            </Show>
            <Show when="signed-out">
              <LandingView isClerkConfigured={isClerkConfigured} />
            </Show>
          </>
        ) : (
          <LandingView isClerkConfigured={false} />
        )}
      </main>

      <StaffProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <footer className="border-t-[0.5px] border-white/[0.07] bg-[#0b0c0e] py-12 text-center text-xs text-[#858687]">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>Vidyalaya School Information System &bull; Internal Staff Operations Portal</div>
          <div className="text-[11px] text-[#71717a]">&copy; {new Date().getFullYear()} All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default function App({ isClerkConfigured = true }) {
  return (
    <AuthUserProvider>
      <MainApp isClerkConfigured={isClerkConfigured} />
    </AuthUserProvider>
  )
}
