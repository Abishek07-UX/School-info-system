import { useEffect, useState } from "react"
import { Show } from "@clerk/react"
import { AuthUserProvider, useAuthUser } from "./context/AuthUserContext"
import { ToastProvider, useToast } from "./context/ToastContext"
import { ConfirmProvider } from "./context/ConfirmContext"
import { BrowserRouter, Navigate, useRoutes } from "./lib/router"
import { getAllowedModules } from "./lib/modules"
import { PORTAL_NAME } from "@/lib/branding"
import Navbar from "./components/common/Navbar"
import { AppShell } from "./components/layout/AppShell"
import OnboardingView from "./components/OnboardingView"
import PendingApprovalView from "./components/PendingApprovalView"
import DeactivatedAccountView from "./components/DeactivatedAccountView"
import UserRoleManagement from "./components/admin/UserRoleManagement"
import StaffProfileModal from "./components/StaffProfileModal"
import AcademicDashboard from "./components/academic/AcademicDashboard"
import { TimetableHub } from "./components/timetable/TimetableHub"
import LandingPage from "./pages/LandingPage"
import OverviewPage from "./pages/OverviewPage"
import ModulePreviewPage from "./pages/ModulePreviewPage"
import NotFoundPage from "./pages/NotFoundPage"
import { Skeleton } from "@/components/ui/skeleton"

/** Sends the user home with a short explanation when their role can't open a page. */
function NoAccess() {
  const toast = useToast()
  useEffect(() => {
    toast.info("Your role doesn't have access to that page.")
  }, [toast])
  return <Navigate to="/" />
}

function PortalRoutes() {
  const { role, isAdmin, isPrincipal, userProfile, getToken } = useAuthUser()
  const allowed = getAllowedModules(role, { isPrincipal })
  const can = (id) => allowed.some((mod) => mod.id === id)

  return useRoutes([
    { path: "/", element: <OverviewPage /> },
    {
      path: "/timetable/:tab?",
      element: can("timetable") ? (
        <TimetableHub userRole={role} userProfile={userProfile} getToken={getToken} />
      ) : (
        <NoAccess />
      ),
    },
    { path: "/academics/:tab?", element: can("academics") ? <AcademicDashboard /> : <NoAccess /> },
    { path: "/staff", element: isAdmin || isPrincipal ? <UserRoleManagement /> : <NoAccess /> },
    { path: "/modules/:id", element: <ModulePreviewPage /> },
    { path: "*", element: <NotFoundPage /> },
  ])
}

/** Header + footer frame for everything outside the signed-in app shell. */
function PublicLayout({ isClerkConfigured = true, onOpenProfile, children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isClerkConfigured={isClerkConfigured} onOpenProfile={onOpenProfile} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-[1120px] flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6">
          <div>{PORTAL_NAME} · Internal staff operations portal</div>
          <div>&copy; {new Date().getFullYear()} All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

function PortalLoading() {
  return (
    <div className="flex min-h-screen w-full" aria-busy="true" aria-label="Loading your account">
      <div className="hidden w-[248px] shrink-0 space-y-3 border-r border-border p-4 md:block">
        <Skeleton className="h-9 w-40" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-6 p-6 lg:p-8">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[72px]" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[74px]" />
          ))}
        </div>
      </div>
    </div>
  )
}

function AuthenticatedPortal({ onOpenProfile }) {
  const { userProfile, isProfileComplete, isPending, loading } = useAuthUser()

  if (loading) return <PortalLoading />

  // A deactivated account keeps its login but can't use any module
  if (userProfile?.status === "INACTIVE") {
    return (
      <PublicLayout onOpenProfile={onOpenProfile}>
        <DeactivatedAccountView />
      </PublicLayout>
    )
  }

  // Step 1: Complete mandatory profile details
  if (!isProfileComplete) {
    return (
      <PublicLayout>
        <OnboardingView />
      </PublicLayout>
    )
  }

  // Step 2: Once details exist, if role is PENDING, show Pending Approval waiting screen
  if (isPending) {
    return (
      <PublicLayout onOpenProfile={onOpenProfile}>
        <PendingApprovalView onEditProfile={onOpenProfile} />
      </PublicLayout>
    )
  }

  // Step 3: Approved user enters the app
  return (
    <AppShell onOpenProfile={onOpenProfile}>
      <PortalRoutes />
    </AppShell>
  )
}

function MainApp({ isClerkConfigured = true }) {
  const [showProfileModal, setShowProfileModal] = useState(false)
  const openProfile = () => setShowProfileModal(true)

  return (
    <>
      {isClerkConfigured ? (
        <>
          <Show when="signed-in">
            <AuthenticatedPortal onOpenProfile={openProfile} />
          </Show>
          <Show when="signed-out">
            <PublicLayout>
              <LandingPage isClerkConfigured />
            </PublicLayout>
          </Show>
        </>
      ) : (
        <PublicLayout isClerkConfigured={false}>
          <LandingPage isClerkConfigured={false} />
        </PublicLayout>
      )}

      <StaffProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  )
}

export default function App({ isClerkConfigured = true }) {
  return (
    <AuthUserProvider>
      <BrowserRouter>
        <ToastProvider>
          <ConfirmProvider>
            <MainApp isClerkConfigured={isClerkConfigured} />
          </ConfirmProvider>
        </ToastProvider>
      </BrowserRouter>
    </AuthUserProvider>
  )
}
