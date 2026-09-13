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
  Sparkles,
  School,
  ArrowRight,
  User,
  AlertTriangle,
  Layers,
  Lock,
  Calendar,
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
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/40",
      count: "39 Classes / 8 Periods",
      desc: "Conflict-free weekly class timetables, faculty routing schedules with Buildings E/F/G, and exam date sheets.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "academics",
      name: "Academics & Exams",
      icon: BookOpen,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/40",
      count: "351 Term Exams",
      desc: "3-term exam scheduling, batch numerical marks recording, automated letter grade conversion & report cards.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "students",
      name: "Student Management",
      icon: Users,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/30",
      count: "1,387 Enrolled",
      desc: "Register students, manage biographical profiles, guardian contacts & academic history across Grades 1–13.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "teachers",
      name: "Teacher Management",
      icon: GraduationCap,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      count: "62 Faculty",
      desc: "Teacher profiles, department specializations, and subject-class assignments for all 3 terms.",
      roles: ["ADMIN", "PRINCIPAL"],
    },
    {
      id: "attendance",
      name: "Attendance Tracking",
      icon: CalendarCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      count: "96.4% Today",
      desc: "Daily student & teacher attendance recording with monthly heatmaps and 80% threshold alerts.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "finance",
      name: "Finance & Fee Ledger",
      icon: CreditCard,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      count: "$42.5k Logged",
      desc: "Fee structure configuration, manual offline receipt recording, and overdue balance tracking.",
      roles: ["ADMIN", "PRINCIPAL", "FINANCE_STAFF"],
    },
    {
      id: "admin",
      name: "User & Role Administration",
      icon: Shield,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/40",
      count: "Staff Accounts",
      desc: "User management, NIC verification, status toggling, and role permissions assignment.",
      roles: ["ADMIN", "PRINCIPAL"],
    },
    {
      id: "tickets",
      name: "Support Tickets",
      icon: Ticket,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      count: "3 Open Tickets",
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
        return <Badge variant="pink" className="shadow-sm">👑 Administrator</Badge>
      case "PRINCIPAL":
        return <Badge variant="purple" className="shadow-sm">🎓 Principal</Badge>
      case "TEACHER":
        return <Badge variant="default" className="shadow-sm">👨‍🏫 Teaching Staff</Badge>
      case "FINANCE_STAFF":
        return <Badge variant="success" className="shadow-sm">💰 Finance Staff</Badge>
      default:
        return <Badge variant="warning" className="shadow-sm">⏳ Pending Approval</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-4" />
        <div className="text-sm font-semibold">Loading your staff credentials & permissions...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Welcome back, {displayName} 👋
            </h1>
            {getRoleBadge(role)}
          </div>
          <p className="text-sm text-slate-400">
            School Information System &bull; Centralized Academic Operations Portal
          </p>
        </div>

        {/* Action Bar Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenProfile}
            className="gap-1.5"
          >
            <User className="h-4 w-4 text-indigo-400" />
            My Profile
          </Button>

          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="gap-1.5"
          >
            <Layers className="h-4 w-4" />
            Overview
          </Button>

          <Button
            variant={activeTab === "timetable" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("timetable")}
            className="gap-1.5 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/40 hover:to-purple-600/40 text-indigo-200 border-indigo-500/30"
          >
            <Calendar className="h-4 w-4 text-indigo-400" />
            Timetable & Schedules
          </Button>

          <Button
            variant={activeTab === "academics" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("academics")}
            className="gap-1.5"
          >
            <BookOpen className="h-4 w-4" />
            Academics & Exams
          </Button>

          {(isAdmin || isPrincipal) && (
            <Button
              variant={activeTab === "admin" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("admin")}
              className="gap-1.5"
            >
              <Shield className="h-4 w-4 text-pink-400" />
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
            className="gap-1.5"
          >
            ← Back to Portal Overview
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
            className="gap-1.5"
          >
            ← Back to Portal Overview
          </Button>
          <UserRoleManagement />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="border-white/10 p-5 flex items-center gap-4 hover:border-indigo-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold font-heading text-white">1,387</div>
                <div className="text-xs text-slate-400 font-semibold">Enrolled Students</div>
              </div>
            </Card>

            <Card className="border-white/10 p-5 flex items-center gap-4 hover:border-purple-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold font-heading text-white">62</div>
                <div className="text-xs text-slate-400 font-semibold">Teaching Faculty</div>
              </div>
            </Card>

            <Card className="border-white/10 p-5 flex items-center gap-4 hover:border-emerald-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <School className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold font-heading text-white">39</div>
                <div className="text-xs text-slate-400 font-semibold">Classes (1–13 A/B/C)</div>
              </div>
            </Card>

            <Card className="border-white/10 p-5 flex items-center gap-4 hover:border-amber-500/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-extrabold font-heading text-white">45 Halls</div>
                <div className="text-xs text-slate-400 font-semibold">Buildings E, F, G</div>
              </div>
            </Card>
          </div>

          {/* Module Selector & Navigation Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-heading text-white">
                  Your Accessible Operational Modules
                </h2>
                <p className="text-xs text-slate-400">
                  Authorized for your assigned role: <span className="font-semibold text-indigo-300">{role}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                    className={`p-6 cursor-pointer border-white/10 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all group relative overflow-hidden ${
                      isTimetable ? "ring-1 ring-indigo-500/40 bg-indigo-950/30" : isAcademics ? "ring-1 ring-sky-500/30 bg-sky-950/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${mod.bg} ${mod.color} border ${mod.border} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-[11px] font-semibold text-slate-300">
                        {mod.count}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold font-heading text-white group-hover:text-indigo-300 transition-colors">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {mod.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
                      {isTimetable ? (
                        <span className="text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Open Timetable Engine <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      ) : isAcademics ? (
                        <span className="text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Open Evaluation Hub <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      ) : isAdminModule ? (
                        <span className="text-pink-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Manage Staff Accounts <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1 group-hover:text-slate-200">
                          View Module Specs <ArrowRight className="h-3.5 w-3.5" />
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
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-4" />
        <div className="text-sm font-semibold">Loading your staff account permissions...</div>
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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Warning Banner if Clerk not configured */}
      {!isClerkConfigured && (
        <Alert variant="warning" className="border-amber-500/40 bg-amber-950/40">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle>Clerk Authentication Notice</AlertTitle>
          <AlertDescription>
            Please copy <code>.env.example</code> to <code>.env</code> inside the <code>frontend/</code> directory and add your <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable live staff login.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="flex justify-center">
          <Badge variant="default" className="text-xs px-3.5 py-1 font-semibold gap-1.5 shadow-md">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            Vidyalaya School Information System
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white leading-tight">
          Unified Academic & Administrative Portal
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Centralized operations for school administrators and teaching faculty — conflict-free weekly timetables, classroom routing, student records, daily attendance, 3-term examinations, numerical mark grading, and fee ledgers.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isClerkConfigured ? (
            <SignInButton mode="modal">
              <Button size="lg" className="gap-2 text-base font-bold shadow-xl shadow-indigo-500/25 px-8">
                <Lock className="h-4 w-4" /> Sign In to Staff Portal
              </Button>
            </SignInButton>
          ) : (
            <Button
              size="lg"
              onClick={() =>
                alert("Add your VITE_CLERK_PUBLISHABLE_KEY in frontend/.env to enable live sign-in!")
              }
              className="gap-2 text-base font-bold shadow-xl shadow-indigo-500/25 px-8"
            >
              <Lock className="h-4 w-4" /> Sign In Demo Mode
            </Button>
          )}
        </div>
      </div>

      {/* Highlights Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center">
          <div className="text-2xl font-extrabold font-heading text-indigo-400">1,387+</div>
          <div className="text-xs text-slate-400 mt-1">Students Enrolled</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center">
          <div className="text-2xl font-extrabold font-heading text-purple-400">62</div>
          <div className="text-xs text-slate-400 mt-1">Teaching Faculty</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center">
          <div className="text-2xl font-extrabold font-heading text-emerald-400">39</div>
          <div className="text-xs text-slate-400 mt-1">Grade 1–13 Classes</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center">
          <div className="text-2xl font-extrabold font-heading text-amber-400">45 Halls</div>
          <div className="text-xs text-slate-400 mt-1">Buildings E, F, G</div>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 p-6 space-y-3 hover:border-indigo-500/40 transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold font-heading text-white">Conflict-Free Timetables</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            40-minute periods, 07:50 AM start, interval breaks, classroom routing across Buildings E, F, G, and 100% clash prevention.
          </p>
        </Card>

        <Card className="border-white/10 p-6 space-y-3 hover:border-emerald-500/40 transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold font-heading text-white">Attendance Tracking</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fast daily student & teacher attendance recording with monthly compliance reports and alerts.
          </p>
        </Card>

        <Card className="border-white/10 p-6 space-y-3 hover:border-sky-500/40 transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold font-heading text-white">Exams & Report Cards</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Numerical mark entry with automatic letter grade conversion, class rankings, and printable transcripts.
          </p>
        </Card>

        <Card className="border-white/10 p-6 space-y-3 hover:border-amber-500/40 transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold font-heading text-white">Finance & Fee Ledger</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configure fee schedules, log offline receipt collections, and monitor outstanding term balances.
          </p>
        </Card>
      </div>
    </div>
  )
}

function MainApp({ isClerkConfigured = true }) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
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

      <footer className="border-t border-white/10 bg-slate-950/80 py-6 text-center text-xs text-slate-500 backdrop-blur-md">
        Vidyalaya School Information System &copy; {new Date().getFullYear()} &bull; Internal Staff Operations Portal
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
