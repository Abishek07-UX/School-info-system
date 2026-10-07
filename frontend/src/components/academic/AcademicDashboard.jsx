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
  const { getToken, role, isPrincipal } = useAuthUser()
  const isTeacherUser = role === "TEACHER"
  const [activeTab, setActiveTab] = useState(isTeacherUser ? "marks" : "exams")
  const [classes, setClasses] = useState([])
  const [preselectedExam, setPreselectedExam] = useState(null)

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await academicService.getClasses(getToken)
        setClasses(data || [])
      } catch (err) {
        console.error("Failed to load classes:", err)
      }
    }
    loadClasses()
  }, [getToken])

  const handleSelectExamForMarkEntry = (exam) => {
    setPreselectedExam(exam)
    setActiveTab("marks")
  }

  const teacherTabs = [
    {
      id: "marks",
      label: "Batch Mark Entry",
      desc: "Record numeric marks with real-time grade calculation",
      icon: Edit3,
    },
    {
      id: "report_cards",
      label: "Class Report Cards",
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

  const adminTabs = [
    {
      id: "exams",
      label: "Exam Schedules & Terms",
      desc: isPrincipal
        ? "Browse & filter examinations across all 39 classes"
        : "Schedule & filter examinations across all 39 classes",
      icon: Calendar,
    },
    {
      id: "marks",
      label: isPrincipal ? "Student Marks" : "Batch Mark Entry",
      desc: isPrincipal
        ? "View scores and grades for any class"
        : "Record numeric marks with real-time grade calculation",
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

  const tabs = isTeacherUser ? teacherTabs : adminTabs

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

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 border border-border text-accent-blue">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-normal text-foreground">
                Academic & Examination Management Hub
              </h1>
              <Badge variant="success" className="hidden sm:inline-flex text-[10px]">
                Active Term
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
              Comprehensive evaluation platform supporting 3-term academic schedules, per-term independent class ranking, batch numerical marks recording, automated letter grade conversions, and official transcript generation.
            </p>
          </div>
        </div>
      </Card>

      {/* Sub-Tabs Grid Navigation */}
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${tabs.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group cursor-pointer rounded-[10px] border p-4 transition-all ${
                isActive
                  ? "border-border-strong bg-surface-2 ring-1 ring-ring/30 text-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-[6px] border transition-colors ${
                    isActive
                      ? "bg-surface border-accent-blue/40 text-accent-blue"
                      : "bg-surface-2 border-border text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-normal text-xs text-foreground">
                  {tab.label}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                {tab.desc}
              </p>
            </div>
          )
        })}
      </div>

      {/* Main Tab Content */}
      <div className="pt-2">
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
      </div>
    </div>
  )
}
