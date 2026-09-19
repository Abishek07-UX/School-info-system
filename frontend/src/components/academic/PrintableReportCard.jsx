import { Button } from "@/components/ui/button"
import { Printer, X, School } from "lucide-react"

export default function PrintableReportCard({ reportCard, onClose }) {
  if (!reportCard) return null

  const handlePrint = () => {
    window.print()
  }

  const getRankMedal = (rank) => {
    if (rank === 1) return "🥇 1st"
    if (rank === 2) return "🥈 2nd"
    if (rank === 3) return "🥉 3rd"
    return `${rank}th`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl p-8 sm:p-10 font-sans">
        {/* Modal Controls (Hidden during print) */}
        <div className="no-print mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Printer className="h-4 w-4 text-indigo-600" />
            Official Printable Transcript Preview
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Printer className="h-4 w-4" /> Print Transcript
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-1 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <X className="h-4 w-4" /> Close
            </Button>
          </div>
        </div>

        {/* --- PRINTABLE REPORT CARD DOCUMENT --- */}
        <div id="printable-area" className="space-y-6">
          {/* Header Banner */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <School className="h-6 w-6 text-indigo-900" />
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                VIDYALAYA NATIONAL SCHOOL
              </h1>
            </div>
            <p className="text-xs text-slate-600">
              Colombo, Sri Lanka &bull; Tel: +94 11 234 5678 &bull; Email: info@vidyalaya.lk
            </p>
            <div className="inline-block mt-3 rounded-full bg-slate-900 px-5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              STUDENT ACADEMIC REPORT CARD &bull; {reportCard.academicYear}
            </div>
          </div>

          {/* Student & Examination Details Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500">Student Name: </span>
                <strong className="text-slate-900 text-sm">{reportCard.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Admission No: </span>
                <strong className="font-mono text-slate-900">{reportCard.admissionNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500">Class / Grade: </span>
                <strong className="text-slate-900">{reportCard.className}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500">Examination: </span>
                <strong className="text-slate-900">{reportCard.examName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Evaluation Term: </span>
                <strong className="text-indigo-700">
                  {reportCard.termDisplayName || reportCard.term}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Class Teacher: </span>
                <strong className="text-slate-900">
                  {reportCard.classTeacherName || "Appointed Faculty"}
                </strong>
              </div>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800">
                <th className="p-2 text-left w-10">#</th>
                <th className="p-2 text-left">Curriculum Subject</th>
                <th className="p-2 text-center w-24">Max Marks</th>
                <th className="p-2 text-center w-28">Marks Obtained</th>
                <th className="p-2 text-center w-24">Grade</th>
                <th className="p-2 text-left">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              {reportCard.subjectMarks &&
                reportCard.subjectMarks.map((sub, idx) => (
                  <tr key={sub.subjectId} className="border-b border-slate-200">
                    <td className="p-2 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-2 font-semibold text-slate-900">
                      {sub.subjectName}{" "}
                      <span className="text-slate-500 font-normal">({sub.subjectCode})</span>
                    </td>
                    <td className="p-2 text-center text-slate-500">100</td>
                    <td
                      className={`p-2 text-center font-bold ${
                        sub.score >= 50 ? "text-slate-900" : "text-rose-600"
                      }`}
                    >
                      {sub.score}
                    </td>
                    <td className="p-2 text-center font-bold">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sub.grade === "A"
                            ? "bg-emerald-100 text-emerald-800"
                            : sub.grade === "B"
                            ? "bg-sky-100 text-sky-800"
                            : sub.grade === "C"
                            ? "bg-amber-100 text-amber-800"
                            : sub.grade === "S"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-2 text-slate-600">{sub.remarks || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Performance Summary Callout Box with Prominent CLASS RANK */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border-2 border-slate-900 bg-slate-50 p-4 text-center">
            <div className="p-2">
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Marks</div>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {reportCard.totalMarks}{" "}
                <span className="text-xs font-normal text-slate-500">
                  / {reportCard.maxPossibleMarks}
                </span>
              </div>
            </div>

            <div className="p-2">
              <div className="text-[10px] uppercase font-bold text-slate-500">Average</div>
              <div className="text-xl font-extrabold text-indigo-700 mt-0.5">
                {reportCard.averageScore}%
              </div>
            </div>

            <div className="p-2 bg-amber-100 rounded-lg border border-amber-300">
              <div className="text-[10px] uppercase font-extrabold text-amber-900">
                🏆 CLASS RANK
              </div>
              <div className="text-xl font-black text-amber-950 mt-0.5">
                {getRankMedal(reportCard.classRank)}{" "}
                <span className="text-xs font-normal text-amber-800">
                  of {reportCard.totalStudentsInClass}
                </span>
              </div>
            </div>

            <div className="p-2">
              <div className="text-[10px] uppercase font-bold text-slate-500">Result</div>
              <div
                className={`text-lg font-black mt-0.5 ${
                  reportCard.passedOverall ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {reportCard.passedOverall ? "PASSED ✓" : "FAILED ✕"}
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-[10px] font-bold uppercase text-slate-600 mb-1">
              Principal / Faculty Remarks:
            </div>
            <div className="text-xs italic text-slate-800 leading-relaxed">
              "{reportCard.principalRemarks}"
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between pt-8 mt-6">
            <div className="text-center w-48 border-t border-slate-900 pt-2 text-xs text-slate-800">
              Class Teacher's Signature
            </div>
            <div className="text-center w-48 border-t border-slate-900 pt-2 text-xs text-slate-800">
              Principal's Stamp & Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
