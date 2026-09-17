import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Calendar, Save, AlertCircle } from "lucide-react"

export default function ExamModal({
  isOpen,
  onClose,
  onSave,
  examToEdit,
  classes,
}) {
  const [formData, setFormData] = useState({
    name: "",
    academicYear: new Date().getFullYear(),
    term: "TERM_1",
    classId: "",
    startDate: "",
    endDate: "",
    status: "UPCOMING",
    description: "",
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (examToEdit) {
      setFormData({
        name: examToEdit.name || "",
        academicYear: examToEdit.academicYear || new Date().getFullYear(),
        term: examToEdit.term || "TERM_1",
        classId: examToEdit.classId ? String(examToEdit.classId) : "",
        startDate: examToEdit.startDate || "",
        endDate: examToEdit.endDate || "",
        status: examToEdit.status || "UPCOMING",
        description: examToEdit.description || "",
      })
    } else {
      setFormData({
        name: "",
        academicYear: new Date().getFullYear(),
        term: "TERM_1",
        classId: classes.length > 0 ? classes[0].id : "",
        startDate: "",
        endDate: "",
        status: "UPCOMING",
        description: "",
      })
    }
    setError(null)
  }, [examToEdit, classes, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError("Please enter an exam title/name.")
      return
    }
    if (!formData.startDate || !formData.endDate) {
      setError("Please specify both start and end dates.")
      return
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date cannot be after end date.")
      return
    }

    try {
      setSaving(true)
      await onSave({
        ...formData,
        academicYear: parseInt(formData.academicYear, 10),
        classId: formData.classId ? parseInt(formData.classId, 10) : null,
      })
      onClose()
    } catch (err) {
      setError(err.message || "Failed to save examination.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-heading">
                {examToEdit ? "Edit Examination" : "Schedule New Examination"}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Configure examination title, class cohort, evaluation term, and date schedule.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Exam Title */}
          <div className="space-y-1.5">
            <Label htmlFor="exam-name">Examination Name *</Label>
            <Input
              id="exam-name"
              required
              placeholder="e.g. Grade 10 - Term 1 Examination 2026 or Science Olympiad"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Academic Year & Term */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="exam-year">Academic Year *</Label>
              <select
                id="exam-year"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exam-term">Evaluation Term / Category</Label>
              <select
                id="exam-term"
                value={formData.term}
                onChange={(e) => {
                  const newTerm = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    term: newTerm,
                    ...(newTerm === "OTHER" ? { classId: "" } : {}),
                  }))
                }}
                className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="TERM_1">📘 Term 1 (First Term)</option>
                <option value="TERM_2">📗 Term 2 (Second Term)</option>
                <option value="TERM_3">📙 Term 3 (Third Term)</option>
                <option value="OTHER">🌐 Other / School-wide Exam</option>
              </select>
            </div>
          </div>

          {/* Class & Status */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="exam-class">Target Class (Optional)</Label>
              <select
                id="exam-class"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">🌐 Open / School-wide (No specific class)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Grade {c.gradeLevel})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exam-status">Status</Label>
              <select
                id="exam-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="exam-start">Start Date *</Label>
              <Input
                id="exam-start"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exam-end">End Date *</Label>
              <Input
                id="exam-end"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="exam-desc">Description / Instructions (Optional)</Label>
            <Textarea
              id="exam-desc"
              rows={2}
              placeholder="e.g. End of term evaluations covering complete syllabus..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : examToEdit ? "Save Changes" : "Schedule Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
