export function parseExamDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

export function validateExamDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return "Please specify both the start and end dates of the examination."
  }
  if (!parseExamDate(startDate) || !parseExamDate(endDate)) {
    return "Please enter valid start and end dates."
  }
  if (endDate < startDate) {
    return "End date must be after or the same as start date."
  }
  return null
}

export function validateExamSlotDates(slots, startDate, endDate, includeWeekends) {
  for (const slot of slots) {
    if (!slot.examDate) {
      return `Please specify an exam date for ${slot.subjectName}.`
    }
    const date = parseExamDate(slot.examDate)
    if (!date) {
      return `Please enter a valid exam date for ${slot.subjectName}.`
    }
    if (slot.examDate < startDate || slot.examDate > endDate) {
      return `${slot.subjectName} must be scheduled between ${startDate} and ${endDate}.`
    }
    if (!includeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
      return `${slot.subjectName} is scheduled on a weekend. Enable Include Weekends or choose a weekday.`
    }
  }
  return null
}
