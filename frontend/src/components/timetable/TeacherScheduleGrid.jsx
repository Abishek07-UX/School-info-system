import { Fragment } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { MapPin, User, Coffee } from 'lucide-react'

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

export function TeacherScheduleGrid({ scheduleData }) {
  const weeklyGrid = scheduleData?.weeklyGrid || {}

  const workload = scheduleData?.weeklyWorkloadPercentage || 0
  const totalTeaching = scheduleData?.totalTeachingPeriods || 0
  const freePeriods = scheduleData?.freePeriodsCount || 0

  return (
    <div className="w-full space-y-4">
      {/* Teacher Workload Summary Card */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{scheduleData?.teacherName || 'Select Faculty Member'}</h3>
                <p className="text-xs text-muted-foreground">
                  {scheduleData?.teacherEmail} {scheduleData?.phoneNumber ? `• ${scheduleData.phoneNumber}` : ''}
                </p>
              </div>
            </div>

            {/* Workload Stats */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-lg bg-muted/40 px-3.5 py-2 border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Teaching Load</div>
                <div className="text-base font-bold text-foreground">{totalTeaching} <span className="text-xs font-normal text-muted-foreground">/ 40 periods</span></div>
              </div>

              <div className="rounded-lg bg-emerald-500/10 px-3.5 py-2 border border-emerald-500/20 text-center">
                <div className="text-xs text-emerald-700 dark:text-emerald-300">Free Periods</div>
                <div className="text-base font-bold text-emerald-700 dark:text-emerald-300">{freePeriods} periods</div>
              </div>

              <div className="min-w-[140px]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-semibold text-foreground">{workload}%</span>
                </div>
                <Progress value={workload} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5x8 Weekly Timetable Matrix */}
      <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <div className="min-w-[1100px] p-4">
          <div className="grid grid-cols-[100px_repeat(4,1fr)_80px_repeat(4,1fr)] gap-2 text-center text-xs">
            {/* Header */}
            <div className="font-semibold text-muted-foreground py-2 text-left pl-2">Day / Time</div>
            {PERIODS.slice(0, 4).map((p) => (
              <div key={p.number} className="rounded-md bg-muted/60 py-2 px-1 font-medium text-foreground border border-border/40">
                <div>{p.label}</div>
                <div className="text-[10px] text-muted-foreground font-normal">{p.time}</div>
              </div>
            ))}

            {/* Interval Header */}
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

            {/* Rows */}
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
                    return <TeacherSlotCell key={`${day.key}-${p.number}`} slot={slot} />
                  })}

                  {/* Interval Break */}
                  <div className="flex items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-medium text-[11px] py-3">
                    <span className="[writing-mode:vertical-lr] rotate-180 tracking-wider uppercase text-[9px] font-bold">
                      Interval
                    </span>
                  </div>

                  {/* Periods 5 to 8 */}
                  {PERIODS.slice(4).map((p) => {
                    const slot = daySlots[p.number]
                    return <TeacherSlotCell key={`${day.key}-${p.number}`} slot={slot} />
                  })}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function TeacherSlotCell({ slot }) {
  if (!slot) {
    return (
      <div className="flex min-h-[90px] flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 p-2 text-center">
        <Coffee className="h-4 w-4 text-muted-foreground/40 mb-1" />
        <span className="text-[11px] text-muted-foreground/60 font-medium">Free Period</span>
      </div>
    )
  }

  const colorClass = getSubjectColor(slot.subjectName)

  return (
    <div
      className={`flex min-h-[90px] flex-col justify-between rounded-lg border p-2 text-left shadow-xs transition-all hover:shadow-md ${colorClass}`}
    >
      <div>
        <div className="flex items-center justify-between gap-1">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold bg-background/70 border-current/20">
            {slot.className}
          </Badge>
          <span className="text-[10px] font-mono opacity-75">{slot.subjectCode}</span>
        </div>
        <div className="font-semibold text-xs leading-tight mt-1 line-clamp-1">
          {slot.subjectName}
        </div>
      </div>

      <div className="mt-2 pt-1 border-t border-current/10">
        <div className="flex items-center text-[10px] font-medium opacity-90 truncate">
          <MapPin className="h-2.5 w-2.5 mr-1 shrink-0 text-primary" />
          <span className="truncate">{slot.roomCode ? `Room ${slot.roomCode}` : slot.building || 'Home Room'}</span>
        </div>
      </div>
    </div>
  )
}
