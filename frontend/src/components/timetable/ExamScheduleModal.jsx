import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertTriangle, CheckCircle2, Loader2, Calendar } from 'lucide-react'
import { examScheduleService } from '../../services/examScheduleService'

export function ExamScheduleModal({
  isOpen,
  onClose,
  onSaved,
  scheduleToEdit,
  selectedExam,
  classes = [],
  subjects = [],
  teachers = [],
  rooms = [],
  getToken,
}) {
  const [classId, setClassId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [isCustomSubject, setIsCustomSubject] = useState(false)
  const [customSubjectName, setCustomSubjectName] = useState('')
  const [examDate, setExamDate] = useState('')
  const [startTime, setStartTime] = useState('08:30')
  const [endTime, setEndTime] = useState('11:30')
  const [room, setRoom] = useState('')
  const [invigilatorId, setInvigilatorId] = useState('')
  const [coInvigilatorId, setCoInvigilatorId] = useState('')
  const [maxMarks, setMaxMarks] = useState(100)
  const [instructions, setInstructions] = useState('')

  const [checkingConflict, setCheckingConflict] = useState(false)
  const [conflictState, setConflictState] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    if (scheduleToEdit) {
      setClassId(scheduleToEdit.classId ? String(scheduleToEdit.classId) : '')
      const hasCustom = !scheduleToEdit.subjectId || !!scheduleToEdit.customSubjectName
      setIsCustomSubject(hasCustom)
      setCustomSubjectName(scheduleToEdit.customSubjectName || scheduleToEdit.subjectName || '')
      setSubjectId(scheduleToEdit.subjectId ? String(scheduleToEdit.subjectId) : (hasCustom ? '__CUSTOM__' : ''))
      setExamDate(scheduleToEdit.examDate || '')
      setStartTime(scheduleToEdit.startTime ? scheduleToEdit.startTime.substring(0, 5) : '08:30')
      setEndTime(scheduleToEdit.endTime ? scheduleToEdit.endTime.substring(0, 5) : '11:30')
      setRoom(scheduleToEdit.room || '')
      setInvigilatorId(scheduleToEdit.invigilatorId ? String(scheduleToEdit.invigilatorId) : '')
      setCoInvigilatorId(scheduleToEdit.coInvigilatorId ? String(scheduleToEdit.coInvigilatorId) : '')
      setMaxMarks(scheduleToEdit.maxMarks || 100)
      setInstructions(scheduleToEdit.instructions || '')
    } else {
      // If the selected exam is school-wide / has no class, default to no class
      setClassId(selectedExam?.classId ? String(selectedExam.classId) : '')
      setIsCustomSubject(false)
      setCustomSubjectName('')
      setSubjectId(subjects[0]?.id ? String(subjects[0].id) : '')
      setExamDate(selectedExam?.startDate || new Date().toISOString().split('T')[0])
      setStartTime('08:30')
      setEndTime('11:30')
      setRoom('Main Examination Auditorium (G-AUD)')
      setInvigilatorId(teachers[0]?.id ? String(teachers[0].id) : '')
      setCoInvigilatorId('')
      setMaxMarks(100)
      setInstructions('')
    }
    setConflictState(null)
    setErrorMsg(null)
  }, [isOpen, scheduleToEdit, selectedExam, classes, subjects, teachers])

  // Live conflict checking
  useEffect(() => {
    if (!isOpen || !invigilatorId || !examDate || !startTime || !endTime) {
      return
    }

    const timer = setTimeout(async () => {
      setCheckingConflict(true)
      try {
        const res = await examScheduleService.checkConflict(
          {
            classId: classId ? Number(classId) : null,
            invigilatorId: Number(invigilatorId),
            coInvigilatorId: coInvigilatorId ? Number(coInvigilatorId) : null,
            examDate,
            startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
            endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
            room: room || null,
            excludeScheduleId: scheduleToEdit?.id || null,
          },
          getToken
        )
        setConflictState(res)
      } catch (err) {
        console.warn('Exam clash check error:', err)
      } finally {
        setCheckingConflict(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [isOpen, classId, invigilatorId, coInvigilatorId, examDate, startTime, endTime, room, scheduleToEdit?.id, getToken])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!subjectId || !invigilatorId || !examDate) {
      setErrorMsg('Please fill in all required fields (Subject, Invigilator, Exam Date).')
      return
    }

    if (startTime && endTime && startTime >= endTime) {
      setErrorMsg('Start time must be before end time.')
      return
    }

    if (conflictState?.hasConflict) {
      setErrorMsg(conflictState.message)
      return
    }

    if (isCustomSubject && !customSubjectName.trim()) {
      setErrorMsg('Please enter a custom subject name.')
      return
    }
    if (!isCustomSubject && (!subjectId || subjectId === '__CUSTOM__')) {
      setErrorMsg('Please select a subject or enter a custom subject name.')
      return
    }

    setSaving(true)
    setErrorMsg(null)
    try {
      const payload = {
        examId: selectedExam.id,
        classId: classId ? Number(classId) : null,
        subjectId: isCustomSubject ? null : Number(subjectId),
        customSubjectName: isCustomSubject ? customSubjectName.trim() : null,
        examDate,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
        room: room || 'Classroom',
        invigilatorId: Number(invigilatorId),
        coInvigilatorId: coInvigilatorId ? Number(coInvigilatorId) : null,
        maxMarks: Number(maxMarks),
        instructions,
      }

      if (scheduleToEdit?.id) {
        await examScheduleService.updateExamSchedule(scheduleToEdit.id, payload, getToken)
      } else {
        await examScheduleService.createExamSchedule(payload, getToken)
      }

      onSaved?.()
      onClose?.()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save exam schedule.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            {scheduleToEdit ? 'Edit Exam Session' : 'Schedule Examination Slot'}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Exam: <strong className="text-foreground">{selectedExam?.name || 'Selected Examination'}</strong>
          </p>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {/* Class & Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Class</Label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Open / School-wide (No class)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} (Grade {c.gradeLevel})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Subject</Label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCustomSubject
                    setIsCustomSubject(next)
                    if (next) {
                      setSubjectId('__CUSTOM__')
                    } else {
                      setSubjectId(subjects[0]?.id ? String(subjects[0].id) : '')
                    }
                  }}
                  className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                >
                  {isCustomSubject ? 'Select from list' : '+ Enter custom subject'}
                </button>
              </div>

              {!isCustomSubject ? (
                <select
                  value={subjectId}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomSubject(true)
                      setSubjectId('__CUSTOM__')
                    } else {
                      setSubjectId(e.target.value)
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                  <option value="__CUSTOM__">✨ Other / Enter Custom Subject...</option>
                </select>
              ) : (
                <Input
                  value={customSubjectName}
                  onChange={(e) => setCustomSubjectName(e.target.value)}
                  placeholder="e.g. General Knowledge & Logical Reasoning"
                  className="h-9 text-xs"
                  required
                  autoFocus
                />
              )}
            </div>
          </div>

          {/* Date and Times */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Exam Date</Label>
              <Input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Start Time</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">End Time</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Venue / Hall */}
          <div className="space-y-1.5">
            <Label className="text-xs">Exam Venue / Hall</Label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="Home Classroom">Designated Classroom</option>
              <option value="Main Examination Auditorium (G-AUD)">Main Examination Auditorium (G-AUD - 250 seats)</option>
              <option value="Physics Laboratory (G-PHY)">Physics Laboratory (G-PHY)</option>
              <option value="Chemistry Laboratory (G-CHEM)">Chemistry Laboratory (G-CHEM)</option>
              <option value="Computer Laboratory 1 (F-IT-1)">Computer Laboratory 1 (F-IT-1)</option>
              <option value="Central School Library (E-LIB)">Central School Library (E-LIB)</option>
              {rooms.map((r) => (
                <option key={r.code} value={`${r.name} (${r.code})`}>
                  {r.name} ({r.building} - Floor {r.floor})
                </option>
              ))}
            </select>
          </div>

          {/* Invigilators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Chief Invigilator</Label>
                {checkingConflict && (
                  <span className="flex items-center text-[10px] text-muted-foreground">
                    <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" /> Checking...
                  </span>
                )}
              </div>
              <select
                value={invigilatorId}
                onChange={(e) => setInvigilatorId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Assistant Invigilator (Optional)</Label>
              <select
                value={coInvigilatorId}
                onChange={(e) => setCoInvigilatorId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- None --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <Label className="text-xs">Instructions / Notes</Label>
            <Textarea
              placeholder="e.g. Calculators allowed. Students must be seated 15 mins prior."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Conflict Status */}
          {conflictState && (
            <div>
              {conflictState.hasConflict ? (
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-semibold">Clash Detected</AlertTitle>
                  <AlertDescription className="text-xs mt-0.5">{conflictState.message}</AlertDescription>
                </Alert>
              ) : (
                <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>No exam clashes. Venue and invigilators are completely available.</span>
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
              {scheduleToEdit ? 'Update Exam Slot' : 'Schedule Exam Slot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
