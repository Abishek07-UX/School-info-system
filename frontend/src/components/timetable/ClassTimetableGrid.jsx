import { Fragment } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Plus, Edit2, Trash2, Clock, MapPin, User as UserIcon } from 'lucide-react'

const DAYS = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
]

const PERIODS = [
  { number: 1, label: 'Period 1', time: '07:50 – 08:30' },
  { number: 2, label: 'Period 2', time: '08:30 – 09:10' },
  { number: 3, label: 'Period 3', time: '09:10 – 09:50' },
  { number: 4, label: 'Period 4', time: '09:50 – 10:30' },
  // Interval: 10:30 - 10:50
  { number: 5, label: 'Period 5', time: '10:50 – 11:30' },
  { number: 6, label: 'Period 6', time: '11:30 – 12:10' },
  { number: 7, label: 'Period 7', time: '12:10 – 12:50' },
  { number: 8, label: 'Period 8', time: '12:50 – 13:30' },
]

const SUBJECT_COLORS = [
  'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300 dark:bg-blue-950/40',
  'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/40',
  'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 dark:bg-amber-950/40',
  'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 dark:bg-purple-950/40',
  'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 dark:bg-rose-950/40',
  'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300 dark:bg-cyan-950/40',
  'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 dark:bg-indigo-950/40',
  'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300 dark:bg-orange-950/40',
]

function getSubjectColor(subjectName = '') {
  let hash = 0
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % SUBJECT_COLORS.length
  return SUBJECT_COLORS[index]
}

export function ClassTimetableGrid({
  timetableData,
  isAdmin = false,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
}) {
  const weeklyGrid = timetableData?.weeklyGrid || {}

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <div className="min-w-[1100px] p-4">
        {/* Class Banner Info */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/40 p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
              {timetableData?.gradeLevel || '—'}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{timetableData?.className || 'Select Class'}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <MapPin className="h-3 w-3" />
                <span>{timetableData?.building || 'Main Campus'}</span> • 
                <span className="font-medium text-foreground">{timetableData?.roomCode ? `Room ${timetableData.roomCode}` : 'Home Room'}</span> • 
                <span>Class Teacher: <strong className="text-foreground">{timetableData?.classTeacherName || 'Not Assigned'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-background text-xs py-1 px-3">
              <Clock className="h-3 w-3 mr-1 text-primary" />
              <span>07:50 AM – 01:30 PM (40m Periods)</span>
            </Badge>
            <Badge variant="secondary" className="text-xs py-1 px-2.5">
              Assigned: {timetableData?.assignedSlotsCount || 0}/40 slots
            </Badge>
          </div>
        </div>

        {/* Timetable Table */}
        <div className="grid grid-cols-[100px_repeat(4,1fr)_80px_repeat(4,1fr)] gap-2 text-center text-xs">
          {/* Header Row */}
          <div className="font-semibold text-muted-foreground py-2 text-left pl-2">Day / Time</div>
          {PERIODS.slice(0, 4).map((p) => (
            <div key={p.number} className="rounded-md bg-muted/60 py-2 px-1 font-medium text-foreground border border-border/40">
              <div>{p.label}</div>
              <div className="text-[10px] text-muted-foreground font-normal">{p.time}</div>
            </div>
          ))}

          {/* Interval Column Header */}
          <div className="flex flex-col justify-center rounded-md bg-amber-500/15 py-2 px-1 text-amber-700 dark:text-amber-300 font-semibold border border-amber-500/30">
            <div>Interval</div>
            <div className="text-[9px] font-normal">10:30-10:50</div>
          </div>

          {PERIODS.slice(4).map((p) => (
            <div key={p.number} className="rounded-md bg-muted/60 py-2 px-1 font-medium text-foreground border border-border/40">
              <div>{p.label}</div>
              <div className="text-[10px] text-muted-foreground font-normal">{p.time}</div>
            </div>
          ))}

          {/* Day Rows */}
          {DAYS.map((day) => {
            const daySlots = weeklyGrid[day.key] || {}

            return (
              <Fragment key={day.key}>
                {/* Day Label */}
                <div className="flex items-center font-semibold text-foreground text-xs pl-2 bg-muted/20 rounded-md">
                  {day.label}
                </div>

                {/* Periods 1 to 4 */}
                {PERIODS.slice(0, 4).map((p) => {
                  const slot = daySlots[p.number]
                  return (
                    <SlotCell
                      key={`${day.key}-${p.number}`}
                      slot={slot}
                      day={day.key}
                      period={p.number}
                      isAdmin={isAdmin}
                      onAdd={() => onAddSlot?.(day.key, p.number)}
                      onEdit={() => onEditSlot?.(slot)}
                      onDelete={() => onDeleteSlot?.(slot.id)}
                    />
                  )
                })}

                {/* Interval Cell */}
                <div className="flex items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium text-[11px] py-3">
                  <span className="[writing-mode:vertical-lr] rotate-180 tracking-wider uppercase text-[9px] font-bold">
                    Interval
                  </span>
                </div>

                {/* Periods 5 to 8 */}
                {PERIODS.slice(4).map((p) => {
                  const slot = daySlots[p.number]
                  return (
                    <SlotCell
                      key={`${day.key}-${p.number}`}
                      slot={slot}
                      day={day.key}
                      period={p.number}
                      isAdmin={isAdmin}
                      onAdd={() => onAddSlot?.(day.key, p.number)}
                      onEdit={() => onEditSlot?.(slot)}
                      onDelete={() => onDeleteSlot?.(slot.id)}
                    />
                  )
                })}
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SlotCell({ slot, isAdmin, onAdd, onEdit, onDelete }) {
  if (!slot) {
    return (
      <div className="group relative flex min-h-[90px] flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/50 p-2 hover:border-primary/50 transition-colors">
        <span className="text-[11px] text-muted-foreground/60 italic font-light">Free Slot</span>
        {isAdmin && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdd}
            className="mt-1 h-6 text-[10px] px-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-3 w-3 mr-1" />
            Assign
          </Button>
        )}
      </div>
    )
  }

  const colorClass = getSubjectColor(slot.subjectName)

  return (
    <div
      className={`group relative flex min-h-[90px] flex-col justify-between rounded-lg border p-2 text-left transition-all hover:shadow-md ${colorClass}`}
    >
      <div>
        <div className="font-semibold text-xs leading-tight line-clamp-1">
          {slot.subjectName}
        </div>
        <div className="text-[10px] opacity-80 mt-0.5">
          {slot.subjectCode}
        </div>
      </div>

      <div className="mt-2 pt-1 border-t border-current/10">
        <div className="flex items-center text-[10px] font-medium opacity-90 truncate">
          <UserIcon className="h-2.5 w-2.5 mr-1 shrink-0" />
          <span className="truncate">{slot.teacherName || 'Teacher'}</span>
        </div>
      </div>

      {isAdmin && (
        <div className="absolute right-1 top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded p-0.5 shadow-sm border border-border/40">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Edit slot"
          >
            <Edit2 className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive"
            title="Remove slot"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  )
}
