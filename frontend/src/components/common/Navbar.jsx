import { Show, SignInButton, useUser, useClerk } from "@clerk/react"
import { useAuthUser } from "@/context/AuthUserContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SCHOOL_NAME } from "@/lib/branding"
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
  School,
  LogIn,
  LogOut,
  CreditCard,
  Users,
  Clock,
} from "lucide-react"

export default function Navbar({
  isClerkConfigured = true,
  onOpenProfile,
  setActiveTab,
}) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { userProfile, role } = useAuthUser()

  const getRoleBadge = (r) => {
    switch (r) {
      case "ADMIN":
        return (
          <Badge variant="default" className="gap-1 font-normal">
            <Shield className="h-3 w-3 text-accent-blue" /> Administrator
          </Badge>
        )
      case "PRINCIPAL":
        return (
          <Badge variant="default" className="gap-1 font-normal">
            <GraduationCap className="h-3 w-3 text-accent-blue" /> Principal
          </Badge>
        )
      case "TEACHER":
        return (
          <Badge variant="secondary" className="gap-1 font-normal">
            <Users className="h-3 w-3 text-muted-foreground" /> Teaching Faculty
          </Badge>
        )
      case "FINANCE_STAFF":
        return (
          <Badge variant="success" className="gap-1 font-normal">
            <CreditCard className="h-3 w-3 text-success" /> Finance Staff
          </Badge>
        )
      case "UNREGISTERED":
        return (
          <Badge variant="outline" className="gap-1 font-normal">
            <Clock className="h-3 w-3 text-muted-foreground" /> Registration
          </Badge>
        )
      default:
        return (
          <Badge variant="warning" className="gap-1 font-normal">
            <Clock className="h-3 w-3 text-warning" /> Pending Approval
          </Badge>
        )
    }
  }

  const displayName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
    : user?.firstName || "Staff Member"

  const initials = (userProfile?.firstName?.[0] || user?.firstName?.[0] || "S") +
    (userProfile?.lastName?.[0] || user?.lastName?.[0] || "M")

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-[72px] max-w-[1080px] items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab && setActiveTab("overview")}
          className="flex cursor-pointer items-center gap-3 group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface border border-border shadow-card transition-transform group-hover:scale-105">
            <School className="h-4 w-4 text-accent-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal tracking-tight text-foreground">
                {SCHOOL_NAME}
              </span>
              <span className="hidden sm:inline-block rounded-[5.26px] bg-surface-2 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground border border-border">
                Staff Portal
              </span>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Operations & Scheduling
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
                    <Button variant="ghost" className="relative h-9 gap-2 rounded-[10px] px-2 hover:bg-surface-hover">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user?.imageUrl} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="hidden text-left md:block">
                        <div className="text-xs font-normal text-foreground leading-tight">
                          {displayName}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-tight">
                          {role}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="font-normal text-foreground">{displayName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {user?.primaryEmailAddress?.emailAddress || userProfile?.email}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onOpenProfile} className="cursor-pointer">
                      <User className="mr-2 h-3.5 w-3.5 text-accent-blue" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ redirectUrl: "/" })}
                      className="cursor-pointer text-danger focus:text-danger focus:bg-danger-soft"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5 text-danger" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Show>

              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="sm" className="gap-1.5">
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                  </Button>
                </SignInButton>
              </Show>
            </>
          ) : (
            <Badge variant="warning">Preview Mode (Demo)</Badge>
          )}
        </div>
      </div>
    </header>
  )
}
