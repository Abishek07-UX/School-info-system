import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Wand2, CheckCircle2, AlertTriangle, Loader2, Sparkles, ShieldCheck } from 'lucide-react'
import { timetableService } from '../../services/timetableService'

export function AutoGeneratorModal({
  isOpen,
  onClose,
  onGenerated,
  selectedClass,
  academicYear = 2026,
  getToken,
}) {
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleGenerate = async () => {
    if (!selectedClass?.id) return
    setGenerating(true)
    setErrorMsg(null)
    setResult(null)

    try {
      const generatedSlots = await timetableService.autoGenerateTimetable(selectedClass.id, academicYear, getToken)
      setResult(generatedSlots)
      onGenerated?.()
    } catch (err) {
      setErrorMsg(err.message || 'Auto-generation failed. Please verify teacher-subject allocations.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5 text-primary" />
            Auto-Generate Conflict-Free Timetable
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Target Class: <strong className="text-foreground">{selectedClass?.name}</strong> • Academic Year: {academicYear}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Information box */}
          <div className="rounded-lg border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Backtracking Constraint Engine</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              This engine analyzes existing teacher allocations in <code className="text-primary">teacher_subjects</code>, 
              checks teacher availability across all classes in the school, and constructs a balanced 40-period schedule (8 periods × 5 days) with:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li><strong>Zero teacher double-booking</strong> across the entire school</li>
              <li><strong>Balanced subject distribution</strong> across Monday through Friday</li>
              <li>Standard Sri Lankan school period timing (07:50 AM to 01:30 PM)</li>
            </ul>
          </div>

          {result && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <div>
                <div className="font-semibold">Successfully Generated!</div>
                <div className="mt-0.5">{result.length} periods have been scheduled with 0 conflicts.</div>
              </div>
            </div>
          )}

          {errorMsg && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Generation Failed</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{errorMsg}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={generating}>
            {result ? 'Done' : 'Cancel'}
          </Button>
          {!result && (
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Generating Schedule...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Start Auto-Generation
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
