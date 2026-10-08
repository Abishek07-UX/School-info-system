// URL slugs and labels for module sub-sections, shared by the pages and the breadcrumb.
import { getModules } from "./modules"

export const TIMETABLE_TABS = ["teachers", "classes", "exams"]

export function timetableTabLabel(tab, { isTeacher = false } = {}) {
  return {
    teachers: isTeacher ? "My Schedule" : "Teacher Schedules",
    classes: "Class Timetables",
    exams: "Exam Date Sheets",
  }[tab]
}

// Academic tab ids are the ones the components already use; slugs are their URL form.
export const ACADEMIC_TAB_SLUGS = {
  exams: "exams",
  marks: "marks",
  report_cards: "report-cards",
  analytics: "analytics",
}
export const ACADEMIC_SLUG_TO_TAB = Object.fromEntries(
  Object.entries(ACADEMIC_TAB_SLUGS).map(([tab, slug]) => [slug, tab])
)

export function academicTabLabel(tab, { isTeacher = false, isPrincipal = false } = {}) {
  return {
    exams: "Exam Schedules & Terms",
    marks: isPrincipal ? "Student Marks" : "Batch Mark Entry",
    report_cards: isTeacher ? "Class Report Cards" : "Report Cards & Rankings",
    analytics: "Performance Analytics",
  }[tab]
}

/** Breadcrumb trail for a pathname: [{ label, to? }] */
export function getBreadcrumbs(pathname, roleFlags = {}) {
  const [section, sub] = pathname.split("/").filter(Boolean)
  const crumbs = [{ label: "Overview", to: "/" }]
  if (!section) return [{ label: "Overview" }]

  if (section === "timetable") {
    crumbs.push({ label: "Timetable", to: "/timetable" })
    const label = sub && timetableTabLabel(sub, roleFlags)
    if (label) crumbs.push({ label })
  } else if (section === "academics") {
    crumbs.push({ label: "Academics", to: "/academics" })
    const tab = sub && ACADEMIC_SLUG_TO_TAB[sub]
    if (tab) crumbs.push({ label: academicTabLabel(tab, roleFlags) })
  } else if (section === "staff") {
    crumbs.push({ label: roleFlags.isPrincipal ? "Staff Directory" : "Staff Accounts" })
  } else if (section === "modules") {
    const mod = getModules(roleFlags).find((m) => m.id === sub)
    crumbs.push({ label: mod?.name || "Module" })
  } else {
    crumbs.push({ label: "Not found" })
  }
  // The last crumb is the current page, so it isn't a link
  const last = crumbs[crumbs.length - 1]
  crumbs[crumbs.length - 1] = { label: last.label }
  return crumbs
}
