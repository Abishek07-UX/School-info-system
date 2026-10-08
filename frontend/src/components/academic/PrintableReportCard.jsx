import { Button } from "@/components/ui/button"
import { Printer, X, School } from "lucide-react"
import { SCHOOL_NAME } from "@/lib/branding"

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto print-surface rounded-2xl bg-print-paper text-print-ink shadow-2xl p-8 sm:p-10 font-sans">
        {/* Modal Controls (Hidden during print) */}
        <div className="no-print mb-6 flex items-center justify-between border-b border-print-rule-soft pb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-print-ink-2">
            <Printer className="h-4 w-4 text-accent-blue" />
            Official Printable Transcript Preview
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="gap-2 bg-accent-blue hover:bg-accent-blue/90 text-print-paper"
            >
              <Printer className="h-4 w-4" /> Print Transcript
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-1 border-print-rule-mid text-print-ink-2 hover:bg-print-fill-2"
            >
              <X className="h-4 w-4" /> Close
            </Button>
          </div>
        </div>

        {/* --- PRINTABLE REPORT CARD DOCUMENT --- */}
        <div id="printable-area" className="space-y-6">
          {/* Header Banner */}
          <div className="text-center border-b-2 border-print-rule pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <School className="h-6 w-6 text-print-accent-strong" />
              <h1 className="text-2xl font-extrabold tracking-tight text-print-ink uppercase">
                {SCHOOL_NAME}
              </h1>
            </div>
            <div className="inline-block mt-3 rounded-full bg-print-ink px-5 py-1 text-xs font-bold uppercase tracking-wider text-print-paper">
              STUDENT ACADEMIC REPORT CARD &bull; {reportCard.academicYear}
            </div>
          </div>

          {/* Student & Examination Details Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-print-rule-soft bg-print-fill p-4 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-print-muted">Student Name: </span>
                <strong className="text-print-ink text-sm">{reportCard.studentName}</strong>
              </div>
              <div>
                <span className="text-print-muted">Admission No: </span>
                <strong className="font-mono text-print-ink">{reportCard.admissionNumber}</strong>
              </div>
              <div>
                <span className="text-print-muted">Class / Grade: </span>
                <strong className="text-print-ink">{reportCard.className}</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-print-muted">Examination: </span>
                <strong className="text-print-ink">{reportCard.examName}</strong>
              </div>
              <div>
                <span className="text-print-muted">Evaluation Term: </span>
                <strong className="text-print-accent">
                  {reportCard.termDisplayName || reportCard.term}
                </strong>
              </div>
              <div>
                <span className="text-print-muted">Class Teacher: </span>
                <strong className="text-print-ink">
                  {reportCard.classTeacherName || "Appointed Faculty"}
                </strong>
              </div>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-print-fill-2 border-b-2 border-print-rule-mid text-print-ink">
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
                  <tr key={sub.subjectId} className="border-b border-print-rule-soft">
                    <td className="p-2 text-print-muted font-mono">{idx + 1}</td>
                    <td className="p-2 font-semibold text-print-ink">
                      {sub.subjectName}{" "}
                      <span className="text-print-muted font-normal">({sub.subjectCode})</span>
                    </td>
                    <td className="p-2 text-center text-print-muted">100</td>
                    <td
                      className={`p-2 text-center font-bold ${
                        sub.score >= 50 ? "text-print-ink" : "text-print-fail"
                      }`}
                    >
                      {sub.score}
                    </td>
                    <td className="p-2 text-center font-bold">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sub.grade === "A"
                            ? "bg-grade-a/10 text-grade-a"
                            : sub.grade === "B"
                            ? "bg-grade-b/10 text-grade-b"
                            : sub.grade === "C"
                            ? "bg-grade-c/10 text-grade-c"
                            : sub.grade === "S"
                            ? "bg-grade-s/10 text-grade-s"
                            : "bg-grade-f/10 text-grade-f"
                        }`}
                      >
                        {sub.grade}
                      </span>
                    </td>
                    <td className="p-2 text-print-ink-2">{sub.remarks || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Performance Summary Callout Box with Prominent CLASS RANK */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border-2 border-print-rule bg-print-fill p-4 text-center">
            <div className="p-2">
              <div className="text-[10px] uppercase font-bold text-print-muted">Total Marks</div>
              <div className="text-xl font-extrabold text-print-ink mt-0.5">
                {reportCard.totalMarks}{" "}
                <span className="text-xs font-normal text-print-muted">
                  / {reportCard.maxPossibleMarks}
                </span>
              </div>
            </div>

            <div className="p-2">
              <div className="text-[10px] uppercase font-bold text-print-muted">Average</div>
              <div className="text-xl font-extrabold text-print-accent mt-0.5">
                {reportCard.averageScore}%
              </div>
            </div>

            <div className="p-2 bg-print-highlight-soft rounded-lg border border-print-highlight-border">
              <div className="text-[10px] uppercase font-extrabold text-print-highlight">
                🏆 CLASS RANK
              </div>
              <div className="text-xl font-black text-print-highlight mt-0.5">
                {getRankMedal(reportCard.classRank)}{" "}
                <span className="text-xs font-normal text-print-highlight">
                  of {reportCard.totalStudentsInClass}
                </span>
              </div>
            </div>

            <div className="p-2">
              <div className="text-[10px] uppercase font-bold text-print-muted">Result</div>
              <div
                className={`text-lg font-black mt-0.5 ${
                  reportCard.passedOverall ? "text-print-pass" : "text-print-fail"
                }`}
              >
                {reportCard.passedOverall ? "PASSED ✓" : "FAILED ✕"}
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="rounded-xl border border-print-rule-soft bg-print-fill p-4">
            <div className="text-[10px] font-bold uppercase text-print-ink-2 mb-1">
              Principal / Faculty Remarks:
            </div>
            <div className="text-xs italic text-print-ink leading-relaxed">
              "{reportCard.principalRemarks}"
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between pt-8 mt-6">
            <div className="text-center w-48 border-t border-print-rule pt-2 text-xs text-print-ink">
              Class Teacher's Signature
            </div>
            <div className="text-center w-48 border-t border-print-rule pt-2 text-xs text-print-ink">
              Principal's Stamp & Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
