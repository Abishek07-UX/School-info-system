import { Show, SignInButton, UserButton, useUser } from "@clerk/react"
import { useAuthUser } from "@/context/AuthUserContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  GraduationCap,
  User,
  Shield,
  BookOpen,
  School,
  LogIn,
  Calendar,
} from "lucide-react"

export default function Navbar({
  isClerkConfigured = true,
  onOpenProfile,
  setActiveTab,
}) {
  const { user } = useUser()
  const { userProfile, role, isAdmin, isPrincipal } = useAuthUser()

  const getRoleBadge = (r) => {
    switch (r) {
      case "ADMIN":
        return <Badge variant="pink" className="shadow-sm">👑 Administrator</Badge>
      case "PRINCIPAL":
        return <Badge variant="purple" className="shadow-sm">🎓 Principal</Badge>
      case "TEACHER":
        return <Badge variant="default" className="shadow-sm">👨‍🏫 Teaching Staff</Badge>
      case "FINANCE_STAFF":
        return <Badge variant="success" className="shadow-sm">💰 Finance Staff</Badge>
      case "UNREGISTERED":
        return <Badge variant="outline" className="text-slate-400 border-slate-700 shadow-sm">📝 Staff Registration</Badge>
      default:
        return <Badge variant="warning" className="shadow-sm">⏳ Pending Approval</Badge>
    }
  }

  const displayName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
    : user?.firstName || "Staff Member"

  const initials = (userProfile?.firstName?.[0] || user?.firstName?.[0] || "S") +
    (userProfile?.lastName?.[0] || user?.lastName?.[0] || "M")

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab && setActiveTab("overview")}
          className="flex cursor-pointer items-center gap-3 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <School className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Vidyalaya SIS
              </span>
              <span className="hidden sm:inline-block rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                Staff Portal
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block">
              School Information & Operations
            </p>
          </div>
        </div>

        {/* Center / Navigation Links (When signed in) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isClerkConfigured ? (
            <>
              <Show when="signed-in">
                {/* Active Role Badge */}
                <div className="hidden md:flex items-center">
                  {getRoleBadge(role)}
                </div>

                {/* Profile & User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 gap-2 rounded-xl px-2 hover:bg-slate-900 border border-transparent hover:border-white/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="hidden text-left md:block">
                        <div className="text-xs font-semibold text-slate-200 leading-tight">
                          {displayName}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">
                          {role}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="font-bold text-white">{displayName}</div>
                      <div className="text-xs text-slate-400 truncate">{user?.primaryEmailAddress?.emailAddress || userProfile?.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onOpenProfile} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4 text-indigo-400" />
                      <span>My Staff Profile</span>
                    </DropdownMenuItem>
                    {setActiveTab && (
                      <>
                        <DropdownMenuItem onClick={() => setActiveTab("overview")} className="cursor-pointer">
                          <BookOpen className="mr-2 h-4 w-4 text-purple-400" />
                          <span>Dashboard Overview</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveTab("timetable")} className="cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4 text-indigo-400" />
                          <span>Timetable & Schedules</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveTab("academics")} className="cursor-pointer">
                          <GraduationCap className="mr-2 h-4 w-4 text-sky-400" />
                          <span>Academics & Exams</span>
                        </DropdownMenuItem>
                        {(isAdmin || isPrincipal) && (
                          <DropdownMenuItem onClick={() => setActiveTab("admin")} className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4 text-pink-400" />
                            <span>Staff Accounts Admin</span>
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center pl-1">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9 ring-2 ring-indigo-500/30 rounded-xl",
                      },
                    }}
                  />
                </div>
              </Show>

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="sm" className="gap-1.5 shadow-lg">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </SignInButton>
              </Show>
            </>
          ) : (
            <Badge variant="warning">Preview Mode (No Clerk Key)</Badge>
          )}
        </div>
      </div>
    </header>
  )
}
