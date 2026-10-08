import { useState, useEffect } from "react"
import { academicService } from "@/services/academicService"
import { useAuthUser } from "@/context/AuthUserContext"
import { useLocation, useNavigate, useParams, Navigate } from "@/lib/router"
import { ACADEMIC_SLUG_TO_TAB, ACADEMIC_TAB_SLUGS, academicTabLabel } from "@/lib/navigation"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Edit3, Award, TrendingUp, GraduationCap, Eye } from "lucide-react"
import ExamManagementTab from "./ExamManagementTab"
import BatchMarkEntryTab from "./BatchMarkEntryTab"
import ReportCardTab from "./ReportCardTab"
import PerformanceAnalyticsTab from "./PerformanceAnalyticsTab"

const TAB_ICONS = { exams: Calendar, marks: Edit3, report_cards: Award, analytics: TrendingUp }

export default function AcademicDashboard() {
  const { getToken, role, isPrincipal } = useAuthUser()
  const isTeacherUser = role === "TEACHER"
  const { tab: slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])

  const tabIds = isTeacherUser ? ["marks", "report_cards", "analytics"] : ["exams", "marks", "report_cards", "analytics"]
  const defaultTab = tabIds[0]
  const requestedTab = slug ? ACADEMIC_SLUG_TO_TAB[slug] : defaultTab
  const activeTab = tabIds.includes(requestedTab) ? requestedTab : null
  // An exam handed over from "Enter Marks" on the exams list
  const preselectedExam = activeTab === "marks" ? location.state?.exam ?? null : null

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

  if (!activeTab) return <Navigate to={`/academics/${ACADEMIC_TAB_SLUGS[defaultTab]}`} />

  const goToTab = (tab) => navigate(`/academics/${ACADEMIC_TAB_SLUGS[tab]}`)

  const handleSelectExamForMarkEntry = (exam) => {
    navigate(`/academics/${ACADEMIC_TAB_SLUGS.marks}`, { state: { exam } })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        title="Academics"
        description="Term exams, mark entry with automatic letter grades, report cards and class performance — for all three terms."
        actions={<Badge variant="outline">39 classes · Grades 1–13</Badge>}
      >
        {isPrincipal && (
          <div className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            View only — principals can browse every class but not change marks or exams.
          </div>
        )}
      </PageHeader>

      <Tabs value={activeTab} onValueChange={goToTab}>
        <TabsList variant="underline" aria-label="Academic sections">
          {tabIds.map((id) => {
            const Icon = TAB_ICONS[id]
            return (
              <TabsTrigger key={id} value={id}>
                <Icon />
                {academicTabLabel(id, { isTeacher: isTeacherUser, isPrincipal })}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="exams" className="mt-6">
          <ExamManagementTab classes={classes} onSelectExamForMarkEntry={handleSelectExamForMarkEntry} />
        </TabsContent>
        <TabsContent value="marks" className="mt-6">
          <BatchMarkEntryTab classes={classes} preselectedExam={preselectedExam} />
        </TabsContent>
        <TabsContent value="report_cards" className="mt-6">
          <ReportCardTab classes={classes} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <PerformanceAnalyticsTab classes={classes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
