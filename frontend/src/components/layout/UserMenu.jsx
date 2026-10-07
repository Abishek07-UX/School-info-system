import { useClerk } from "@clerk/react"
import { LogOut, User } from "lucide-react"
import { useAuthUser } from "@/context/AuthUserContext"
import { ROLE_LABELS } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { useDisplayName } from "@/hooks/useDisplayName"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** Avatar button with profile + sign-out menu. `compact` hides the name next to the avatar. */
export function UserMenu({ onOpenProfile, compact = false, className }) {
  const { signOut } = useClerk()
  const { role } = useAuthUser()
  const { displayName, initials, imageUrl, email } = useDisplayName()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-10 items-center gap-2.5 rounded-[10px] px-1.5 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
          !compact && "pr-2.5",
          className
        )}
        aria-label="Account menu"
      >
        <Avatar className="h-7 w-7">
          <AvatarImage src={imageUrl} alt="" />
          <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
        </Avatar>
        {!compact && (
          <span className="hidden min-w-0 md:block">
            <span className="block truncate text-[13px] font-medium leading-tight text-foreground">{displayName}</span>
            <span className="block truncate text-[11px] leading-tight text-muted-foreground">
              {ROLE_LABELS[role] || role}
            </span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="truncate font-medium text-foreground">{displayName}</div>
          <div className="truncate text-xs text-muted-foreground">{email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onOpenProfile && (
          <DropdownMenuItem onClick={onOpenProfile} className="gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Edit Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: "/" })}
          className="gap-2 text-danger focus:bg-danger-soft focus:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
