// Letter-grade scale shared by mark entry, report cards and analytics.
export const GRADE_SCALE = [
  { grade: "A", min: 75, label: "Distinction" },
  { grade: "B", min: 65, label: "Very Good" },
  { grade: "C", min: 50, label: "Good" },
  { grade: "S", min: 35, label: "Pass" },
  { grade: "F", min: 0, label: "Fail" },
]

export const GRADE_LABELS = Object.fromEntries(GRADE_SCALE.map((g) => [g.grade, g.label]))

/** Text/background/border classes for a grade, built on the --grade-* theme tokens. */
export const GRADE_TONES = {
  A: "text-grade-a bg-grade-a/10 border-grade-a/25",
  B: "text-grade-b bg-grade-b/10 border-grade-b/25",
  C: "text-grade-c bg-grade-c/10 border-grade-c/25",
  S: "text-grade-s bg-grade-s/10 border-grade-s/25",
  F: "text-grade-f bg-grade-f/10 border-grade-f/25",
}

/** Text-only color class for a grade (tables, inline figures). */
export const GRADE_TEXT = {
  A: "text-grade-a",
  B: "text-grade-b",
  C: "text-grade-c",
  S: "text-grade-s",
  F: "text-grade-f",
}

/** Bar fill class for a grade (distribution charts). */
export const GRADE_FILL = {
  A: "bg-grade-a",
  B: "bg-grade-b",
  C: "bg-grade-c",
  S: "bg-grade-s",
  F: "bg-grade-f",
}

export function calculateGrade(score) {
  if (score === "" || score === null || score === undefined || isNaN(score)) return null
  const s = parseFloat(score)
  return GRADE_SCALE.find((g) => s >= g.min)?.grade ?? "F"
}
