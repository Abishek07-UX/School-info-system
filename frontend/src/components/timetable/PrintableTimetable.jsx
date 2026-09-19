import { Button } from '../ui/button'
import { Printer, X } from 'lucide-react'

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
      <div className="max-w-5xl mx-auto rounded-xl border border-border bg-white text-black p-8 shadow-md print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="text-center pb-4 border-b-2 border-black/80 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">SRI LANKA NATIONAL SCHOOL</h1>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-600 mt-0.5">
            ACADEMIC YEAR {timetableData?.academicYear || 2026} • OFFICIAL MASTER TIMETABLE
          </h2>
          <div className="mt-2 flex justify-center items-center gap-6 text-xs text-neutral-700 font-medium">
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
        <table className="w-full border-collapse border border-black text-center text-xs">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-black p-2 text-left font-bold w-24">Day</th>
              {PERIODS.slice(0, 4).map((p) => (
                <th key={p.number} className="border border-black p-1.5 font-bold">
                  <div>{p.label}</div>
                  <div className="text-[9px] font-normal text-neutral-500">{p.time}</div>
                </th>
              ))}
              <th className="border border-black p-1 font-bold bg-neutral-200 w-16 text-[10px]">
                INTERVAL<br /><span className="text-[8px] font-normal">10:30-10:50</span>
              </th>
              {PERIODS.slice(4).map((p) => (
                <th key={p.number} className="border border-black p-1.5 font-bold">
                  <div>{p.label}</div>
                  <div className="text-[9px] font-normal text-neutral-500">{p.time}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => {
              const daySlots = weeklyGrid[day.key] || {}

              return (
                <tr key={day.key} className="h-16">
                  <td className="border border-black p-2 text-left font-bold bg-neutral-50">
                    {day.label}
                  </td>

                  {/* P1 to P4 */}
                  {PERIODS.slice(0, 4).map((p) => {
                    const slot = daySlots[p.number]
                    return (
                      <td key={p.number} className="border border-black p-1 align-middle">
                        {slot ? (
                          <div>
                            <div className="font-bold text-[11px] leading-tight">
                              {isTeacherView ? slot.className : slot.subjectName}
                            </div>
                            <div className="text-[9px] text-neutral-600 mt-0.5">
                              {isTeacherView ? slot.subjectName : slot.teacherName}
                            </div>
                            {isTeacherView && slot.roomCode && (
                              <div className="text-[8px] font-mono text-neutral-500">
                                {slot.roomCode}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[10px]">—</span>
                        )}
                      </td>
                    )
                  })}

                  {/* Interval */}
                  <td className="border border-black p-0 bg-neutral-100 text-[9px] font-bold text-neutral-500">
                    RECESS
                  </td>

                  {/* P5 to P8 */}
                  {PERIODS.slice(4).map((p) => {
                    const slot = daySlots[p.number]
                    return (
                      <td key={p.number} className="border border-black p-1 align-middle">
                        {slot ? (
                          <div>
                            <div className="font-bold text-[11px] leading-tight">
                              {isTeacherView ? slot.className : slot.subjectName}
                            </div>
                            <div className="text-[9px] text-neutral-600 mt-0.5">
                              {isTeacherView ? slot.subjectName : slot.teacherName}
                            </div>
                            {isTeacherView && slot.roomCode && (
                              <div className="text-[8px] font-mono text-neutral-500">
                                {slot.roomCode}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[10px]">—</span>
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
        <div className="mt-8 pt-4 border-t border-neutral-300 flex justify-between items-center text-[10px] text-neutral-500">
          <div>Generated by Antigravity School Information System</div>
          <div className="flex gap-12">
            <div>Principal's Signature: __________________</div>
            <div>Date: __________________</div>
          </div>
        </div>
      </div>
    </div>
  )
}
