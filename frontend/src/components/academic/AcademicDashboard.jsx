import { useState, useEffect } from "react"
import { academicService } from "@/services/academicService"
import { useAuthUser } from "@/context/AuthUserContext"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Award,
  TrendingUp,
  GraduationCap,
  Building2,
} from "lucide-react"
import ExamManagementTab from "./ExamManagementTab"
import BatchMarkEntryTab from "./BatchMarkEntryTab"
import ReportCardTab from "./ReportCardTab"
import PerformanceAnalyticsTab from "./PerformanceAnalyticsTab"

export default function AcademicDashboard({ onBack }) {
  const { getToken } = useAuthUser()
  const [activeTab, setActiveTab] = useState("exams") // 'exams', 'marks', 'report_cards', 'analytics'
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [preselectedExam, setPreselectedExam] = useState(null)

  useEffect(() => {
    async function loadClasses() {
      try {
        setLoadingClasses(true)
        const data = await academicService.getClasses(getToken)
        setClasses(data || [])
      } catch (err) {
        console.error("Failed to load classes:", err)
      } finally {
        setLoadingClasses(false)
      }
    }
    loadClasses()
  }, [getToken])

  const handleSelectExamForMarkEntry = (exam) => {
    setPreselectedExam(exam)
    setActiveTab("marks")
  }

  const tabs = [
    {
      id: "exams",
      label: "Exam Schedules & Terms",
      desc: "Schedule & filter examinations across all 39 classes",
      icon: Calendar,
      activeBg: "border-indigo-500/50 bg-indigo-500/10",
    },
    {
      id: "marks",
      label: "Batch Mark Entry",
      desc: "Record numeric marks with real-time grade calculation",
      icon: Edit3,
      activeBg: "border-purple-500/50 bg-purple-500/10",
    },
    {
      id: "report_cards",
      label: "Report Cards & Rankings",
      desc: "Generate term report cards, annual summaries & class leaderboards",
      icon: Award,
      activeBg: "border-amber-500/50 bg-amber-500/10",
    },
    {
      id: "analytics",
      label: "Performance Analytics",
      desc: "Class pass rates, grade spreads & 3-term student trajectories",
      icon: TrendingUp,
      activeBg: "border-emerald-500/50 bg-emerald-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portal Overview
        </Button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Building2 className="h-3.5 w-3.5 text-indigo-400" />
          <span>School Academic Management</span>
          <span>&bull;</span>
          <Badge variant="outline" className="text-indigo-300 border-indigo-500/30">
            39 Classes &bull; Grades 1–13 (A, B, C)
          </Badge>
        </div>
      </div>

      {/* Hero Banner Card */}
      <Card className="relative overflow-hidden border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60 p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
            <GraduationCap className="h-9 w-9 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold font-heading text-white">
                Academic & Examination Management Hub
              </h1>
              <Badge variant="success" className="hidden sm:inline-flex text-[10px]">
                Active Term
              </Badge>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Comprehensive evaluation platform supporting 3-term academic schedules, per-term independent class ranking, batch numerical marks recording, automated letter grade conversions, and official transcript generation.
            </p>
          </div>
        </div>
      </Card>

      {/* Sub-Tabs Grid Navigation */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                isActive
                  ? `${tab.activeBg} shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30`
                  : "border-white/10 bg-slate-900/60 hover:bg-slate-800/80 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    isActive ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 group-hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-bold text-sm text-white font-heading">
                  {tab.label}
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {tab.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {loadingClasses ? (
          <Card className="p-12 text-center text-slate-400 border-white/10">
            <div className="flex justify-center mb-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
            Initializing academic configuration and class records...
          </Card>
        ) : (
          <>
            {activeTab === "exams" && (
              <ExamManagementTab
                classes={classes}
                onSelectExamForMarkEntry={handleSelectExamForMarkEntry}
              />
            )}

            {activeTab === "marks" && (
              <BatchMarkEntryTab
                classes={classes}
                preselectedExam={preselectedExam}
              />
            )}

            {activeTab === "report_cards" && (
              <ReportCardTab classes={classes} />
            )}

            {activeTab === "analytics" && (
              <PerformanceAnalyticsTab classes={classes} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
