import { Badge } from '../ui/badge'
import { Plus, Edit2, Trash2, Clock, MapPin, User as UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WeekGrid, getSubjectColor } from './WeekGrid'

export function ClassTimetableGrid({
  timetableData,
  isAdmin = false,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
}) {
  const assigned = timetableData?.assignedSlotsCount || 0

  return (
    <div className="space-y-3">
      {/* Class summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent-blue-soft text-sm font-semibold text-accent-blue">
            {timetableData?.gradeLevel || '—'}
          </div>
          <div>
            <h3 className="text-section text-foreground">{timetableData?.className || 'Select a class'}</h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {timetableData?.building || 'Main campus'} ·{' '}
                <span className="text-foreground-2">
                  {timetableData?.roomCode ? `Room ${timetableData.roomCode}` : 'Home room'}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5" />
                Class teacher: <span className="text-foreground-2">{timetableData?.classTeacherName || 'Not assigned'}</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Clock className="h-3 w-3" />
            07:50 – 13:30 · 40-min periods
          </Badge>
          <Badge variant={assigned >= 40 ? 'success' : 'secondary'} className="tabular">
            {assigned}/40 periods assigned
          </Badge>
        </div>
      </div>

      <WeekGrid
        weeklyGrid={timetableData?.weeklyGrid}
        renderCell={(slot, day, period) => (
          <SlotCell
            slot={slot}
            isAdmin={isAdmin}
            onAdd={() => onAddSlot?.(day, period)}
            onEdit={() => onEditSlot?.(slot)}
            onDelete={() => onDeleteSlot?.(slot.id)}
          />
        )}
      />
    </div>
  )
}

function SlotCell({ slot, isAdmin, onAdd, onEdit, onDelete }) {
  if (!slot) {
    if (!isAdmin) {
      return (
        <div className="flex h-full min-h-[84px] items-center justify-center rounded-[10px] border border-dashed border-border text-[11px] text-muted-foreground/70">
          Free
        </div>
      )
    }
    return (
      <button
        type="button"
        onClick={onAdd}
        className="group flex h-full min-h-[84px] w-full flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-border text-[11px] text-muted-foreground/70 transition-colors hover:border-accent-blue/50 hover:bg-accent-blue-soft hover:text-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        aria-label="Assign a subject to this period"
      >
        <Plus className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        <span className="group-hover:hidden group-focus-visible:hidden">Free</span>
        <span className="hidden font-medium group-hover:inline group-focus-visible:inline">Assign</span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'group relative flex h-full min-h-[84px] flex-col justify-between rounded-[10px] border p-2.5 text-left transition-shadow duration-150 hover:shadow-card',
        getSubjectColor(slot.subjectName)
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold leading-tight">{slot.subjectName}</div>
        <div className="mt-0.5 text-[10px] opacity-70">{slot.subjectCode}</div>
      </div>
      <div className="mt-2 flex items-center gap-1 truncate text-[10px] font-medium opacity-85">
        <UserIcon className="h-3 w-3 shrink-0" />
        <span className="truncate">{slot.teacherName || 'Teacher'}</span>
      </div>

      {isAdmin && (
        <div className="absolute right-1 top-1 flex items-center gap-0.5 rounded-[7px] border border-border bg-surface/95 p-0.5 opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="flex h-6 w-6 items-center justify-center rounded-[5px] text-muted-foreground hover:bg-surface-hover hover:text-foreground cursor-pointer"
            title="Edit slot"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="flex h-6 w-6 items-center justify-center rounded-[5px] text-danger hover:bg-danger-soft cursor-pointer"
            title="Remove slot"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
