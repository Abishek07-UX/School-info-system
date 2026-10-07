// Small display formatters shared across screens.

const parseDate = (value) => {
  if (!value) return null
  // Treat plain YYYY-MM-DD as a local calendar date, not UTC midnight
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "12 Mar 2026" */
export function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  const date = parseDate(value)
  return date ? date.toLocaleDateString(undefined, options) : value || "—"
}

/** "2–13 Mar 2026", "28 Feb – 6 Mar 2026", "29 Dec 2026 – 3 Jan 2027" */
export function formatDateRange(start, end) {
  const a = parseDate(start)
  const b = parseDate(end)
  if (!a && !b) return "—"
  if (!a || !b) return formatDate(start || end)
  if (a.getTime() === b.getTime()) return formatDate(start)
  const sameYear = a.getFullYear() === b.getFullYear()
  const sameMonth = sameYear && a.getMonth() === b.getMonth()
  if (sameMonth) {
    return `${a.getDate()}–${formatDate(end)}`
  }
  if (sameYear) {
    return `${formatDate(start, { day: "numeric", month: "short" })} – ${formatDate(end)}`
  }
  return `${formatDate(start)} – ${formatDate(end)}`
}
