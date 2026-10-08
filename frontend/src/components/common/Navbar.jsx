import { Show, SignInButton } from "@clerk/react"
import { LogIn, School } from "lucide-react"
import { SCHOOL_NAME } from "@/lib/branding"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserMenu } from "@/components/layout/UserMenu"

/**
 * Header for screens outside the main app shell: the signed-out landing page and the
 * onboarding / pending approval / deactivated gates.
 */
export default function Navbar({ isClerkConfigured = true, onOpenProfile }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
            <School className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-foreground">{SCHOOL_NAME}</span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">Staff Portal</span>
          </span>
        </a>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {isClerkConfigured ? (
            <>
              <Show when="signed-in">
                <UserMenu onOpenProfile={onOpenProfile} />
              </Show>
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <Button size="sm" className="gap-1.5">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </SignInButton>
              </Show>
            </>
          ) : (
            <Badge variant="warning">Preview mode</Badge>
          )}
        </div>
      </div>
    </header>
  )
}
