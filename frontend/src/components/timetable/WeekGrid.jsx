/* eslint-disable react-refresh/only-export-components */
import { Fragment, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export const DAYS = [
  { key: 'MONDAY', label: 'Monday', short: 'Mon' },
  { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { key: 'FRIDAY', label: 'Friday', short: 'Fri' },
]

export const PERIODS = [
  { number: 1, label: 'P1', start: '07:50', end: '08:30' },
  { number: 2, label: 'P2', start: '08:30', end: '09:10' },
  { number: 3, label: 'P3', start: '09:10', end: '09:50' },
  { number: 4, label: 'P4', start: '09:50', end: '10:30' },
  // Interval: 10:30 – 10:50
  { number: 5, label: 'P5', start: '10:50', end: '11:30' },
  { number: 6, label: 'P6', start: '11:30', end: '12:10' },
  { number: 7, label: 'P7', start: '12:10', end: '12:50' },
  { number: 8, label: 'P8', start: '12:50', end: '13:30' },
]

// Light/dark pairs so subject colours stay readable in both themes
const SUBJECT_COLORS = [
  'bg-sky-50 border-sky-200 text-sky-950 dark:bg-sky-400/10 dark:border-sky-400/25 dark:text-sky-100',
  'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-400/10 dark:border-emerald-400/25 dark:text-emerald-100',
  'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-400/10 dark:border-amber-400/25 dark:text-amber-100',
  'bg-violet-50 border-violet-200 text-violet-950 dark:bg-violet-400/10 dark:border-violet-400/25 dark:text-violet-100',
  'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-400/10 dark:border-rose-400/25 dark:text-rose-100',
  'bg-cyan-50 border-cyan-200 text-cyan-950 dark:bg-cyan-400/10 dark:border-cyan-400/25 dark:text-cyan-100',
  'bg-indigo-50 border-indigo-200 text-indigo-950 dark:bg-indigo-400/10 dark:border-indigo-400/25 dark:text-indigo-100',
  'bg-orange-50 border-orange-200 text-orange-950 dark:bg-orange-400/10 dark:border-orange-400/25 dark:text-orange-100',
]

export function getSubjectColor(subjectName = '') {
  let hash = 0
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** The weekday and period happening right now, if school is in session. */
function useNow() {
  return useMemo(() => {
    const now = new Date()
    const day = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][now.getDay()]
    const minutes = now.getHours() * 60 + now.getMinutes()
    const period = PERIODS.find((p) => minutes >= toMinutes(p.start) && minutes < toMinutes(p.end))?.number ?? null
    return { day, period }
  }, [])
}

function PeriodHeader({ period, highlighted }) {
  return (
    <div
      className={cn(
        'rounded-[8px] px-1 py-2 text-center transition-colors duration-150',
        highlighted ? 'bg-accent-blue-soft text-accent-blue' : 'bg-surface-2 text-foreground'
      )}
    >
      <div className="text-xs font-semibold">{period.label}</div>
      <div className={cn('tabular text-[10px]', highlighted ? 'text-accent-blue/80' : 'text-muted-foreground')}>
        {period.start}–{period.end}
      </div>
    </div>
  )
}

/**
 * 5-day × 8-period week with the interval column. `renderCell(slot, dayKey, period)`
 * draws each cell. Hovering a cell highlights its day and period headers; today's row
 * and the current period are marked.
 */
export function WeekGrid({ weeklyGrid = {}, renderCell }) {
  const [hover, setHover] = useState(null)
  const now = useNow()

  const renderPeriods = (day, periods) =>
    periods.map((p) => {
      const isNow = now.day === day.key && now.period === p.number
      return (
        <div
          key={`${day.key}-${p.number}`}
          onMouseEnter={() => setHover({ day: day.key, period: p.number })}
          onFocus={() => setHover({ day: day.key, period: p.number })}
          className={cn('relative min-w-0 rounded-[10px]', isNow && 'ring-2 ring-accent-blue ring-offset-2 ring-offset-surface')}
        >
          {isNow && (
            <span className="absolute -top-2 left-2 z-[1] rounded-full bg-accent-blue px-1.5 text-[9px] font-semibold uppercase tracking-wide text-white dark:text-background">
              Now
            </span>
          )}
          {renderCell((weeklyGrid[day.key] || {})[p.number], day.key, p.number)}
        </div>
      )
    })

  return (
    <div
      className="w-full overflow-x-auto rounded-[12px] border border-border bg-surface shadow-card"
      onMouseLeave={() => setHover(null)}
    >
      <div className="grid min-w-[1040px] grid-cols-[88px_repeat(4,minmax(0,1fr))_44px_repeat(4,minmax(0,1fr))] gap-2 p-3 text-xs">
        {/* Header row */}
        <div className="sticky left-0 z-[2] bg-surface" />
        {PERIODS.slice(0, 4).map((p) => (
          <PeriodHeader key={p.number} period={p} highlighted={hover?.period === p.number} />
        ))}
        <div className="flex items-center justify-center rounded-[8px] bg-warning-soft text-warning" title="Interval 10:30–10:50">
          <span className="text-[10px] font-semibold">Break</span>
        </div>
        {PERIODS.slice(4).map((p) => (
          <PeriodHeader key={p.number} period={p} highlighted={hover?.period === p.number} />
        ))}

        {/* Day rows */}
        {DAYS.map((day) => {
          const isToday = now.day === day.key
          const highlighted = hover?.day === day.key
          return (
            <Fragment key={day.key}>
              <div className="sticky left-0 z-[2] flex items-center bg-surface pr-1">
                <div
                  className={cn(
                    'flex h-full w-full flex-col justify-center rounded-[8px] px-2.5 transition-colors duration-150',
                    highlighted ? 'bg-accent-blue-soft text-accent-blue' : 'bg-surface-2 text-foreground'
                  )}
                >
                  <span className="text-xs font-semibold">{day.label}</span>
                  {isToday && <span className="text-[10px] font-medium text-accent-blue">Today</span>}
                </div>
              </div>
              {renderPeriods(day, PERIODS.slice(0, 4))}
              <div aria-hidden className="rounded-[8px] bg-warning-soft/60" />
              {renderPeriods(day, PERIODS.slice(4))}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
