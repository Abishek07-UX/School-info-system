import test from "node:test"
import assert from "node:assert/strict"
import { validateExamDateRange, validateExamSlotDates } from "./examTimetableDateValidation.js"

const slot = (examDate) => ({ subjectName: "Mathematics", examDate })

test("rejects an end date before the start date and invalid calendar dates", () => {
  assert.match(validateExamDateRange("2026-10-05", "2026-10-04"), /End date must be after/)
  assert.match(validateExamDateRange("2026-02-30", "2026-03-02"), /valid start and end dates/)
  assert.equal(validateExamDateRange("2026-10-05", "2026-10-05"), null)
})

test("rejects subject dates outside the selected period", () => {
  assert.match(validateExamSlotDates([slot("2026-10-04")], "2026-10-05", "2026-10-09", true), /between/)
  assert.match(validateExamSlotDates([slot("2026-10-10")], "2026-10-05", "2026-10-09", true), /between/)
  assert.equal(validateExamSlotDates([slot("2026-10-05")], "2026-10-05", "2026-10-09", false), null)
  assert.equal(validateExamSlotDates([slot("2026-10-09")], "2026-10-05", "2026-10-09", false), null)
})

test("rejects both Saturday and Sunday unless weekends are included", () => {
  for (const date of ["2026-10-10", "2026-10-11"]) {
    assert.match(validateExamSlotDates([slot(date)], "2026-10-09", "2026-10-12", false), /weekend/)
    assert.equal(validateExamSlotDates([slot(date)], "2026-10-09", "2026-10-12", true), null)
  }
})

test("rejects a missing subject date", () => {
  assert.match(validateExamSlotDates([slot("")], "2026-10-05", "2026-10-09", false), /specify an exam date/)
})
