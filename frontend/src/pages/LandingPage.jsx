import { useRef } from "react"
import { SignInButton } from "@clerk/react"
import { AlertTriangle, ArrowDown, BookOpen, Calendar, CalendarCheck, CheckCircle2, CreditCard, Lock } from "lucide-react"
import { useGSAP, fadeRise, staggerIn } from "@/lib/motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const STATS = [
  { value: "1,387", label: "Enrolled students" },
  { value: "62", label: "Teaching faculty" },
  { value: "39", label: "Grade 1–13 classes" },
  { value: "45", label: "Halls in Buildings E, F, G" },
]

const FEATURES = [
  {
    icon: Calendar,
    tone: "bg-accent-blue-soft text-accent-blue",
    title: "Conflict-free timetables",
    body: "40-minute periods from 07:50, interval breaks, classroom routing across Buildings E, F and G, and clash prevention.",
  },
  {
    icon: CalendarCheck,
    tone: "bg-success-soft text-success",
    title: "Attendance tracking",
    body: "Fast daily student and teacher attendance with monthly compliance reports and 80% threshold alerts.",
  },
  {
    icon: BookOpen,
    tone: "bg-accent-blue-soft text-accent-blue",
    title: "Exams & grading",
    body: "Numerical mark entry with automatic letter grades, class rankings and printable report cards.",
  },
  {
    icon: CreditCard,
    tone: "bg-warning-soft text-warning",
    title: "Finance ledger",
    body: "Fee structure setup, offline receipt logging and term-end balance tracking.",
  },
]

const PREVIEW_ROWS = [
  { title: "Grade 10-A Timetable", meta: "40-min periods · Hall E-204", status: "Conflict-free", tone: "text-success", icon: CheckCircle2 },
  { title: "Grade 11 Mathematics · Term 1", meta: "42 student records graded", status: "Grades ready", tone: "text-accent-blue" },
  { title: "Daily faculty attendance", meta: "62 / 62 verified on campus", status: "100% present", tone: "text-success" },
]

export default function LandingPage({ isClerkConfigured }) {
  const scope = useRef(null)

  useGSAP(
    () => {
      fadeRise("[data-hero]", { stagger: 0.07, y: 12, duration: 0.5 })
      fadeRise("[data-preview]", { delay: 0.2, y: 16, duration: 0.6 })
      staggerIn("[data-preview-row]", { delay: 0.45, each: 0.08 })
      staggerIn("[data-feature]", { delay: 0.3, each: 0.06 })
    },
    { scope }
  )

  const signInButton = (
    <Button size="lg" className="gap-2">
      <Lock className="h-4 w-4" /> Sign In to Staff Portal
    </Button>
  )

  return (
    <div ref={scope} className="mx-auto max-w-[1120px] space-y-16 px-4 py-12 sm:px-6 sm:py-16 lg:space-y-20">
      {!isClerkConfigured && (
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Clerk authentication isn't configured</AlertTitle>
          <AlertDescription>
            Copy <code>.env.example</code> to <code>.env</code> inside <code>frontend/</code> and set{" "}
            <code>VITE_CLERK_PUBLISHABLE_KEY</code> to enable staff sign-in.
          </AlertDescription>
        </Alert>
      )}

      <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Badge data-hero variant="default" dot>
            2026 academic year is live
          </Badge>
          <h1 data-hero className="text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[54px]">
            Unified academic and administrative operations.
          </h1>
          <p data-hero className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            One place for school administrators and faculty: conflict-free weekly timetables, classroom routing,
            attendance, 3-term mark entry and offline fee reconciliation.
          </p>
          <div data-hero className="flex flex-wrap items-center gap-3 pt-1">
            {isClerkConfigured ? (
              <SignInButton mode="modal">{signInButton}</SignInButton>
            ) : (
              <Button
                size="lg"
                className="gap-2"
                onClick={() => window.alert("Add VITE_CLERK_PUBLISHABLE_KEY in frontend/.env to enable live sign-in.")}
              >
                <Lock className="h-4 w-4" /> Sign In Demo Mode
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              className="gap-2"
              onClick={() => document.getElementById("capabilities")?.scrollIntoView({ behavior: "smooth" })}
            >
              See what's inside <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div data-preview className="rounded-[16px] border border-border bg-surface p-5 shadow-pop">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Academic engine active
              </div>
              <Badge variant="success">Term 1 · 2026</Badge>
            </div>
            <div className="space-y-2.5">
              {PREVIEW_ROWS.map(({ title, meta, status, tone, icon: Icon }) => (
                <div
                  key={title}
                  data-preview-row
                  className="flex items-center justify-between gap-3 rounded-[10px] bg-surface-2 px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">{title}</div>
                    <div className="truncate text-xs text-muted-foreground">{meta}</div>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1 text-xs font-medium ${tone}`}>
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-y-8 border-y border-border py-8 sm:grid-cols-4">
        {STATS.map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="tabular text-3xl font-semibold tracking-tight text-foreground">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </section>

      <section id="capabilities" className="scroll-mt-24 space-y-6">
        <div className="space-y-1">
          <h2 className="text-title text-foreground">Core operational systems</h2>
          <p className="text-sm text-muted-foreground">Everything staff need for the school day, in one portal.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, tone, title, body }) => (
            <div key={title} data-feature className="space-y-3 rounded-[12px] border border-border bg-surface p-5 shadow-card">
              <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${tone}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
