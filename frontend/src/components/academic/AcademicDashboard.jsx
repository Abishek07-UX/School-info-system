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
    },
    {
      id: "marks",
      label: "Batch Mark Entry",
      desc: "Record numeric marks with real-time grade calculation",
      icon: Edit3,
    },
    {
      id: "report_cards",
      label: "Report Cards & Rankings",
      desc: "Generate term report cards, annual summaries & class leaderboards",
      icon: Award,
    },
    {
      id: "analytics",
      label: "Performance Analytics",
      desc: "Class pass rates, grade spreads & 3-term student trajectories",
      icon: TrendingUp,
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
          className="gap-2 self-start text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Portal Overview
        </Button>

        <div className="flex items-center gap-2 text-xs text-[#858687]">
          <Building2 className="h-3.5 w-3.5 text-[#858687]" />
          <span>School Academic Management</span>
          <span>&bull;</span>
          <Badge variant="outline" className="text-xs">
            39 Classes &bull; Grades 1–13 (A, B, C)
          </Badge>
        </div>
      </div>

      {/* Hero Banner Card */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#1f1f21] border-[0.5px] border-white/10 text-[#3b82f6]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-normal text-white">
                Academic & Examination Management Hub
              </h1>
              <Badge variant="success" className="hidden sm:inline-flex text-[10px]">
                Active Term
              </Badge>
            </div>
            <p className="text-xs text-[#858687] max-w-3xl leading-relaxed">
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
              className={`group cursor-pointer rounded-[10px] border-[0.5px] p-4 transition-all ${
                isActive
                  ? "border-white/20 bg-[#1f1f21] ring-1 ring-[#3b82f6]/30 text-white"
                  : "border-white/[0.07] bg-[#131416] text-[#858687] hover:border-white/15 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-[6px] border-[0.5px] transition-colors ${
                    isActive
                      ? "bg-[#131416] border-[#3b82f6]/40 text-[#3b82f6]"
                      : "bg-[#1f1f21] border-white/10 text-[#858687] group-hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-normal text-xs text-white">
                  {tab.label}
                </div>
              </div>
              <p className="text-[11px] text-[#858687] leading-relaxed line-clamp-2">
                {tab.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
        {loadingClasses ? (
          <Card className="p-12 text-center text-[#858687]">
            <div className="flex justify-center mb-3">
              <div className="h-6 w-6 animate-spin rounded-full border-[0.5px] border-[#3b82f6] border-t-transparent" />
            </div>
            <div className="text-xs">Initializing academic configuration and class records...</div>
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
