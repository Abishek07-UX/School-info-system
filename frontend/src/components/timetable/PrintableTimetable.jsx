import { Button } from '../ui/button'
import { Printer, X } from 'lucide-react'
import { SCHOOL_NAME, PORTAL_NAME } from '@/lib/branding'

const DAYS = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
]

const PERIODS = [
  { number: 1, label: 'P1', time: '07:50 - 08:30' },
  { number: 2, label: 'P2', time: '08:30 - 09:10' },
  { number: 3, label: 'P3', time: '09:10 - 09:50' },
  { number: 4, label: 'P4', time: '09:50 - 10:30' },
  { number: 5, label: 'P5', time: '10:50 - 11:30' },
  { number: 6, label: 'P6', time: '11:30 - 12:10' },
  { number: 7, label: 'P7', time: '12:10 - 12:50' },
  { number: 8, label: 'P8', time: '12:50 - 13:30' },
]

export function PrintableTimetable({ timetableData, isTeacherView = false, onClose }) {
  const weeklyGrid = timetableData?.weeklyGrid || {}

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-sm p-4 sm:p-8">
      {/* Top Action Bar (Hidden during print) */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} size="sm" className="gap-2 shadow-sm">
            <Printer className="h-4 w-4" />
            Print Official Timetable
          </Button>
          <span className="text-xs text-muted-foreground">Standard A4 Landscape format recommended</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 mr-1" /> Close
        </Button>
      </div>

      {/* Printable Sheet */}
      <div className="print-surface max-w-5xl mx-auto rounded-xl border border-border bg-print-paper text-print-ink p-8 shadow-md print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="text-center pb-4 border-b-2 border-print-rule/80 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">{SCHOOL_NAME}</h1>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-print-ink-2 mt-0.5">
            ACADEMIC YEAR {timetableData?.academicYear || 2026} • OFFICIAL MASTER TIMETABLE
          </h2>
          <div className="mt-2 flex justify-center items-center gap-6 text-xs text-print-ink-2 font-medium">
            {isTeacherView ? (
              <>
                <span>FACULTY MEMBER: <strong>{timetableData?.teacherName}</strong></span>
                <span>EMAIL: <strong>{timetableData?.teacherEmail}</strong></span>
                <span>TOTAL PERIODS: <strong>{timetableData?.totalTeachingPeriods}/40</strong></span>
              </>
            ) : (
              <>
                <span>CLASS: <strong>{timetableData?.className}</strong></span>
                <span>BUILDING / ROOM: <strong>{timetableData?.building} ({timetableData?.roomCode ? `Room ${timetableData.roomCode}` : 'Home Room'})</strong></span>
                <span>CLASS TEACHER: <strong>{timetableData?.classTeacherName}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Timetable Table */}
        <table className="w-full border-collapse border border-print-rule text-center text-xs">
          <thead>
            <tr className="bg-print-fill-2">
              <th className="border border-print-rule p-2 text-left font-bold w-24">Day</th>
              {PERIODS.slice(0, 4).map((p) => (
                <th key={p.number} className="border border-print-rule p-1.5 font-bold">
                  <div>{p.label}</div>
                  <div className="text-[9px] font-normal text-print-muted">{p.time}</div>
                </th>
              ))}
              <th className="border border-print-rule p-1 font-bold bg-print-fill-3 w-16 text-[10px]">
                INTERVAL<br /><span className="text-[8px] font-normal">10:30-10:50</span>
              </th>
              {PERIODS.slice(4).map((p) => (
                <th key={p.number} className="border border-print-rule p-1.5 font-bold">
                  <div>{p.label}</div>
                  <div className="text-[9px] font-normal text-print-muted">{p.time}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const daySlots = weeklyGrid[day.key] || {}

              return (
                <tr key={day.key} className="h-16">
                  <td className="border border-print-rule p-2 text-left font-bold bg-print-fill">
                    {day.label}
                  </td>

                  {/* P1 to P4 */}
                  {PERIODS.slice(0, 4).map((p) => {
                    const slot = daySlots[p.number]
                    return (
                      <td key={p.number} className="border border-print-rule p-1 align-middle">
                        {slot ? (
                          <div>
                            <div className="font-bold text-[11px] leading-tight">
                              {isTeacherView ? slot.className : slot.subjectName}
                            </div>
                            <div className="text-[9px] text-print-ink-2 mt-0.5">
                              {isTeacherView ? slot.subjectName : slot.teacherName}
                            </div>
                            {isTeacherView && slot.roomCode && (
                              <div className="text-[8px] font-mono text-print-muted">
                                {slot.roomCode}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-print-faint text-[10px]">—</span>
                        )}
                      </td>
                    )
                  })}

                  {/* Interval */}
                  <td className="border border-print-rule p-0 bg-print-fill-2 text-[9px] font-bold text-print-muted">
                    RECESS
                  </td>

                  {/* P5 to P8 */}
                  {PERIODS.slice(4).map((p) => {
                    const slot = daySlots[p.number]
                    return (
                      <td key={p.number} className="border border-print-rule p-1 align-middle">
                        {slot ? (
                          <div>
                            <div className="font-bold text-[11px] leading-tight">
                              {isTeacherView ? slot.className : slot.subjectName}
                            </div>
                            <div className="text-[9px] text-print-ink-2 mt-0.5">
                              {isTeacherView ? slot.subjectName : slot.teacherName}
                            </div>
                            {isTeacherView && slot.roomCode && (
                              <div className="text-[8px] font-mono text-print-muted">
                                {slot.roomCode}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-print-faint text-[10px]">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-print-rule-mid flex justify-between items-center text-[10px] text-print-muted">
          <div>Generated by {PORTAL_NAME}</div>
          <div className="flex gap-12">
            <div>Principal's Signature: __________________</div>
            <div>Date: __________________</div>
          </div>
        </div>
      </div>
    </div>
  )
}
