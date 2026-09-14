import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, Search, X } from 'lucide-react'
import { timetableService } from '../../services/timetableService'

const DAYS = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
]

const PERIODS = [
  { number: 1, label: 'Period 1 (07:50 – 08:30)' },
  { number: 2, label: 'Period 2 (08:30 – 09:10)' },
  { number: 3, label: 'Period 3 (09:10 – 09:50)' },
  { number: 4, label: 'Period 4 (09:50 – 10:30)' },
  { number: 5, label: 'Period 5 (10:50 – 11:30)' },
  { number: 6, label: 'Period 6 (11:30 – 12:10)' },
  { number: 7, label: 'Period 7 (12:10 – 12:50)' },
  { number: 8, label: 'Period 8 (12:50 – 13:30)' },
]

export function TimetableSlotModal({
  isOpen,
  onClose,
  onSaved,
  slotToEdit,
  initialDay,
  initialPeriod,
  selectedClass,
  subjects = [],
  teachers = [],
  academicYear = 2026,
  getToken,
}) {
  const [subjectId, setSubjectId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState(initialDay || 'MONDAY')
  const [periodNumber, setPeriodNumber] = useState(initialPeriod || 1)

  const [checkingConflict, setCheckingConflict] = useState(false)
  const [conflictState, setConflictState] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [teacherSearch, setTeacherSearch] = useState('')

  useEffect(() => {
    if (slotToEdit) {
      setSubjectId(slotToEdit.subjectId ? String(slotToEdit.subjectId) : '')
      setTeacherId(slotToEdit.teacherId ? String(slotToEdit.teacherId) : '')
      setDayOfWeek(slotToEdit.dayOfWeek || 'MONDAY')
      setPeriodNumber(slotToEdit.periodNumber || 1)
    } else {
      setSubjectId(subjects[0]?.id ? String(subjects[0].id) : '')
      setTeacherId(teachers[0]?.id ? String(teachers[0].id) : '')
      setDayOfWeek(initialDay || 'MONDAY')
      setPeriodNumber(initialPeriod || 1)
    }
    setConflictState(null)
    setErrorMsg(null)
    setTeacherSearch('')
  }, [isOpen, slotToEdit, initialDay, initialPeriod, subjects, teachers])

  // Real-time conflict checking when teacher, day, or period changes
  useEffect(() => {
    if (!isOpen || !selectedClass?.id || !teacherId || !dayOfWeek || !periodNumber) {
      return
    }

    const timer = setTimeout(async () => {
      setCheckingConflict(true)
      try {
        const res = await timetableService.checkConflict(
          {
            classId: selectedClass.id,
            teacherId: Number(teacherId),
            dayOfWeek,
            periodNumber: Number(periodNumber),
            academicYear,
            excludeSlotId: slotToEdit?.id || null,
          },
          getToken
        )
        setConflictState(res)
      } catch (err) {
        console.warn('Conflict check error:', err)
      } finally {
        setCheckingConflict(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [isOpen, selectedClass?.id, teacherId, dayOfWeek, periodNumber, slotToEdit?.id, academicYear, getToken])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!subjectId || !teacherId) {
      setErrorMsg('Please select both a subject and teacher.')
      return
    }

    if (conflictState?.hasConflict) {
      setErrorMsg(conflictState.message)
      return
    }

    setSaving(true)
    setErrorMsg(null)
    try {
      const payload = {
        classId: selectedClass.id,
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        dayOfWeek,
        periodNumber: Number(periodNumber),
        academicYear,
      }

      if (slotToEdit?.id) {
        await timetableService.updateSlot(slotToEdit.id, payload, getToken)
      } else {
        await timetableService.createSlot(payload, getToken)
      }

      onSaved?.()
      onClose?.()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save timetable slot.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            {slotToEdit ? 'Edit Timetable Slot' : 'Assign Timetable Slot'}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Class: <strong className="text-foreground">{selectedClass?.name || 'Selected Class'}</strong> • Academic Year: {academicYear}
          </p>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {/* Day and Period Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="daySelect" className="text-xs">Day of Week</Label>
              <select
                id="daySelect"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {DAYS.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="periodSelect" className="text-xs">Period Time</Label>
              <select
                id="periodSelect"
                value={periodNumber}
                onChange={(e) => setPeriodNumber(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {PERIODS.map((p) => (
                  <option key={p.number} value={p.number}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="subjectSelect" className="text-xs">Subject</Label>
            <select
              id="subjectSelect"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="" disabled>-- Select Subject --</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="teacherSelect" className="text-xs">Assigned Teacher</Label>
              {checkingConflict && (
                <span className="flex items-center text-[10px] text-muted-foreground">
                  <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" /> Checking availability...
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search teacher by name or email..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="h-8 pl-8 pr-7 text-xs bg-background mb-1"
              />
              {teacherSearch && (
                <button
                  type="button"
                  onClick={() => setTeacherSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-sm"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <select
              id="teacherSelect"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="" disabled>-- Select Teacher --</option>
              {teachers
                .filter((t) => {
                  if (!teacherSearch.trim()) return true
                  const q = teacherSearch.trim().toLowerCase()
                  const name = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase()
                  const email = (t.email || '').toLowerCase()
                  return name.includes(q) || email.includes(q)
                })
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.email})
                  </option>
                ))}
            </select>
          </div>

          {/* Real-time Conflict Alert Status */}
          {conflictState && (
            <div>
              {conflictState.hasConflict ? (
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-semibold">Scheduling Conflict Detected</AlertTitle>
                  <AlertDescription className="text-xs mt-0.5">{conflictState.message}</AlertDescription>
                </Alert>
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>No clashes found. Teacher and class slot are completely free!</span>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving || (conflictState && conflictState.hasConflict)}
            >
              {saving && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
              {slotToEdit ? 'Save Changes' : 'Assign Slot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
