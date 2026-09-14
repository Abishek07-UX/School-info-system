import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Alert, AlertTitle, AlertDescription } from "../ui/alert"
import { Calendar, Sparkles, AlertCircle, Loader2, Award, Info } from "lucide-react"
import { academicService } from "../../services/academicService"

const EXAM_CATEGORIES = [
  { value: "OTHER", label: "Other / School-wide (Entrance, Olympiad, Assessment)" },
  { value: "TERM_1", label: "Term 1 (First Term)" },
  { value: "TERM_2", label: "Term 2 (Mid-Year)" },
  { value: "TERM_3", label: "Term 3 (Final)" },
]

export function GeneralExamModal({
  isOpen,
  onClose,
  onSuccess,
  getToken,
  initialAcademicYear = new Date().getFullYear(),
}) {
  const [name, setName] = useState("")
  const [academicYear, setAcademicYear] = useState(initialAcademicYear)
  const [term, setTerm] = useState("OTHER")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [description, setDescription] = useState("")

  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setName("")
      setAcademicYear(initialAcademicYear || new Date().getFullYear())
      setTerm("OTHER")
      
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      const formatYMD = (d) => d.toISOString().split("T")[0]
      setStartDate(formatYMD(today))
      setEndDate(formatYMD(nextWeek))
      
      setDescription("")
      setErrorMsg(null)
    }
  }, [isOpen, initialAcademicYear])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!name.trim()) {
      setErrorMsg("Please enter an examination title/name.")
      return
    }

    if (!startDate || !endDate) {
      setErrorMsg("Please specify both the start and end dates.")
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg("Start date cannot be after end date.")
      return
    }

    const payload = {
      name: name.trim(),
      academicYear: parseInt(academicYear, 10),
      term,
      classId: null, // School-wide / no grade or class assigned
      startDate,
      endDate,
      status: "UPCOMING",
      description: description.trim() || undefined,
    }

    try {
      setSaving(true)
      const created = await academicService.createExam(payload, getToken)
      if (onSuccess) {
        onSuccess(created)
      }
      onClose()
    } catch (err) {
      setErrorMsg(err.message || "Failed to create examination.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] border-border/80 bg-card text-card-foreground shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="border-b border-border/60 bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Award className="h-4 w-4" />
            School-Wide / Open Examination
          </div>
          <DialogTitle className="text-lg font-bold text-foreground mt-1">
            Create Examination (No Class / Grade)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Create an open examination routine without binding it to a single grade or class.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Banner */}
          <Alert className="border-primary/30 bg-primary/5 py-2.5">
            <Info className="h-4 w-4 text-primary" />
            <AlertTitle className="text-xs font-semibold text-primary">Open Examination</AlertTitle>
            <AlertDescription className="text-[11px] text-muted-foreground">
              Ideal for Entrance Exams, National Olympiads, Multi-grade Competitions, or External Certifications. You can schedule sessions in the date sheet freely.
            </AlertDescription>
          </Alert>

          {errorMsg && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          {/* Exam Name */}
          <div className="space-y-1.5">
            <Label htmlFor="generalExamName" className="text-xs font-medium text-foreground">
              Exam Name / Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="generalExamName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. National Science Olympiad 2026, Scholarship Entrance Test"
              className="h-9 text-xs"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Academic Year */}
            <div className="space-y-1.5">
              <Label htmlFor="generalExamYear" className="text-xs font-medium text-foreground">
                Academic Year <span className="text-destructive">*</span>
              </Label>
              <Input
                id="generalExamYear"
                type="number"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Category / Term */}
            <div className="space-y-1.5">
              <Label htmlFor="generalExamTerm" className="text-xs font-medium text-foreground">
                Category
              </Label>
              <select
                id="generalExamTerm"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {EXAM_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="generalExamStart" className="text-xs font-medium text-foreground">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="generalExamStart"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="generalExamEnd" className="text-xs font-medium text-foreground">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="generalExamEnd"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="generalExamDesc" className="text-xs font-medium text-foreground">
              Description / Notes (Optional)
            </Label>
            <Textarea
              id="generalExamDesc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Open to all students registered for the science olympiad across Grades 8-12."
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Create Exam
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
