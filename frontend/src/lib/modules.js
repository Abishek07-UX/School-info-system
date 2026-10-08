// Single source of truth for portal modules: who can open them, where they live and
// how they're described. Used by the sidebar, the overview grid and route guards.
import {
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  CreditCard,
  Shield,
  Ticket,
  Calendar,
} from "lucide-react"

export const ROLE_LABELS = {
  ADMIN: "Administrator",
  PRINCIPAL: "Principal",
  TEACHER: "Teaching Faculty",
  FINANCE_STAFF: "Finance Staff",
  UNREGISTERED: "Registration",
  PENDING: "Pending Approval",
}

/**
 * `live` modules have a working screen at `path`; the rest open a "coming soon" preview.
 * `navLabel` is the short sidebar label.
 */
export function getModules({ isPrincipal = false } = {}) {
  return [
    {
      id: "timetable",
      name: "Timetable & Schedules",
      navLabel: "Timetable",
      path: "/timetable",
      live: true,
      icon: Calendar,
      count: "39 Classes / 8 Periods",
      cta: "Open timetables",
      desc: "Conflict-free weekly class timetables, faculty routing schedules with Buildings E/F/G, and exam date sheets.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "academics",
      name: "Academics & Exams",
      navLabel: "Academics",
      path: "/academics",
      live: true,
      icon: BookOpen,
      count: "351 Term Exams",
      cta: "Open academics",
      desc: "3-term exam scheduling, batch numerical marks recording, automated letter grade conversion & report cards.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "admin",
      name: isPrincipal ? "Staff Directory" : "User & Role Administration",
      navLabel: "Staff Accounts",
      path: "/staff",
      live: true,
      icon: Shield,
      count: isPrincipal ? "View Only" : "Access Control",
      cta: isPrincipal ? "Browse staff" : "Manage staff accounts",
      desc: isPrincipal
        ? "Browse registered staff, their contact details, roles, and account status."
        : "User management, NIC verification, status toggling, and role permissions assignment.",
      roles: ["ADMIN", "PRINCIPAL"],
    },
    {
      id: "students",
      name: "Student Management",
      navLabel: "Students",
      path: "/modules/students",
      live: false,
      icon: Users,
      count: "1,387 Enrolled",
      desc: "Register students, manage biographical profiles, guardian contacts & academic history across Grades 1–13.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "teachers",
      name: "Teacher Management",
      navLabel: "Teachers",
      path: "/modules/teachers",
      live: false,
      icon: GraduationCap,
      count: "62 Faculty",
      desc: "Teacher profiles, department specializations, and subject-class assignments for all 3 terms.",
      roles: ["ADMIN", "PRINCIPAL"],
    },
    {
      id: "attendance",
      name: "Attendance Tracking",
      navLabel: "Attendance",
      path: "/modules/attendance",
      live: false,
      icon: CalendarCheck,
      count: "96.4% Compliance",
      desc: "Daily student & teacher attendance recording with monthly heatmaps and 80% threshold alerts.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER"],
    },
    {
      id: "finance",
      name: "Finance & Fee Ledger",
      navLabel: "Finance",
      path: "/modules/finance",
      live: false,
      icon: CreditCard,
      count: "Offline Receipts",
      desc: "Fee structure configuration, manual offline receipt recording, and overdue balance tracking.",
      roles: ["ADMIN", "PRINCIPAL", "FINANCE_STAFF"],
    },
    {
      id: "tickets",
      name: "Support Tickets",
      navLabel: "Tickets",
      path: "/modules/tickets",
      live: false,
      icon: Ticket,
      count: "Operational Logs",
      desc: "Internal staff operational issue reporting, assignment, and resolution tracking.",
      roles: ["ADMIN", "PRINCIPAL", "TEACHER", "FINANCE_STAFF"],
    },
  ]
}

export function getAllowedModules(role, options) {
  return getModules(options).filter((mod) => mod.roles.includes(role))
}
