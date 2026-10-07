import { MapPin, User, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WeekGrid, getSubjectColor } from './WeekGrid'

export function TeacherScheduleGrid({ scheduleData }) {
  const workload = scheduleData?.weeklyWorkloadPercentage || 0
  const totalTeaching = scheduleData?.totalTeachingPeriods || 0
  const freePeriods = scheduleData?.freePeriodsCount || 0

  return (
    <div className="w-full space-y-3">
      {/* Teacher workload */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue-soft text-accent-blue">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-section text-foreground">{scheduleData?.teacherName || 'Select a teacher'}</h3>
            <p className="text-xs text-muted-foreground">
              {scheduleData?.teacherEmail} {scheduleData?.phoneNumber ? `· ${scheduleData.phoneNumber}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div>
            <div className="text-xs text-muted-foreground">Teaching</div>
            <div className="tabular text-sm font-semibold text-foreground">
              {totalTeaching} <span className="font-normal text-muted-foreground">/ 40 periods</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Free</div>
            <div className="tabular text-sm font-semibold text-success">{freePeriods} periods</div>
          </div>
          <div className="min-w-[150px]">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted-foreground">Workload</span>
              <span className="tabular font-semibold text-foreground">{workload}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={cn(
                  'h-full rounded-full transition-[width] duration-700 ease-out',
                  workload > 85 ? 'bg-warning' : 'bg-accent-blue'
                )}
                style={{ width: `${Math.min(workload, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <WeekGrid weeklyGrid={scheduleData?.weeklyGrid} renderCell={(slot) => <TeacherSlotCell slot={slot} />} />
    </div>
  )
}

function TeacherSlotCell({ slot }) {
  if (!slot) {
    return (
      <div className="flex h-full min-h-[84px] flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-border text-center">
        <Coffee className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="text-[11px] text-muted-foreground/70">Free</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-[84px] flex-col justify-between rounded-[10px] border p-2.5 text-left transition-shadow duration-150 hover:shadow-card',
        getSubjectColor(slot.subjectName)
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate rounded-[5px] bg-surface/70 px-1.5 text-[10px] font-semibold dark:bg-black/25">
            {slot.className}
          </span>
          <span className="shrink-0 text-[10px] opacity-70">{slot.subjectCode}</span>
        </div>
        <div className="mt-1 truncate text-xs font-semibold leading-tight">{slot.subjectName}</div>
      </div>
      <div className="mt-2 flex items-center gap-1 truncate text-[10px] font-medium opacity-85">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{slot.roomCode ? `Room ${slot.roomCode}` : slot.building || 'Home room'}</span>
      </div>
    </div>
  )
}
