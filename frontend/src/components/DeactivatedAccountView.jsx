import { useState } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ban, RefreshCw } from "lucide-react"
import { useFadeRise } from "@/hooks/useMotion"

export default function DeactivatedAccountView() {
  const { userProfile, refreshUser, loading } = useAuthUser()
  const toast = useToast()
  const [checking, setChecking] = useState(false)
  const cardRef = useFadeRise([], { y: 12 })

  const handleCheckStatus = async () => {
    setChecking(true)
    const fresh = await refreshUser()
    setChecking(false)
    if (!fresh || fresh.status === "INACTIVE") toast.info("Your account is still deactivated.")
  }

  const fullName =
    `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim() ||
    "Staff Member"

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:py-20">
      <div ref={cardRef} className="rounded-[16px] border border-border bg-surface p-6 text-center shadow-pop sm:p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <Ban className="h-6 w-6" />
        </div>
        <Badge variant="destructive" dot>
          Status: Account Deactivated
        </Badge>
        <h1 className="mt-3 text-title text-foreground">Your account is deactivated, {fullName}</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
          An administrator has paused this staff account, so school records aren't available. Contact an
          administrator if you need access again.
        </p>
        <Button onClick={handleCheckStatus} loading={checking} disabled={loading} size="lg" variant="outline" className="mt-6 w-full gap-2">
          <RefreshCw className="h-4 w-4" />
          Check Account Status
        </Button>
      </div>
    </div>
  )
}
