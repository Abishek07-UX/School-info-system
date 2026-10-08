import { useState } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { useToast } from "@/context/ToastContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, RefreshCw, Edit, Mail, Phone, CreditCard, MapPin, User } from "lucide-react"
import { useFadeRise } from "@/hooks/useMotion"
import { RegistrationSteps } from "./common/RegistrationSteps"

function Detail({ icon: Icon, label, children, wide }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm text-foreground">{children || "—"}</dd>
    </div>
  )
}

export default function PendingApprovalView({ onEditProfile }) {
  const { userProfile, refreshUser, loading } = useAuthUser()
  const toast = useToast()
  const [checking, setChecking] = useState(false)
  const cardRef = useFadeRise([], { y: 12 })

  const handleCheckStatus = async () => {
    setChecking(true)
    const fresh = await refreshUser()
    setChecking(false)
    const stillPending = !fresh || !fresh.role || fresh.role === "PENDING" || fresh.status === "PENDING_APPROVAL"
    if (stillPending) toast.info("Not approved yet — an administrator still needs to assign your role.")
  }

  const fullName =
    `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim() ||
    "Staff Member"

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <RegistrationSteps current={1} className="mb-8" />

      <div ref={cardRef} className="rounded-[16px] border border-border bg-surface p-6 shadow-pop sm:p-8">
        <div className="text-center">
          <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft text-warning">
            <Clock className="h-6 w-6" />
            <span className="absolute inset-0 animate-ping rounded-full bg-warning/15 [animation-duration:2.4s]" />
          </div>
          <Badge variant="warning" dot>
            Status: Awaiting Role Assignment
          </Badge>
          <h1 className="mt-3 text-title text-foreground">Thanks, {fullName} — you're registered</h1>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            An administrator will check your details and assign your role. Once that's done, your modules unlock here.
          </p>
        </div>

        <div className="mt-6 rounded-[12px] border border-border bg-surface-2/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Submitted details</span>
            {onEditProfile && (
              <Button variant="ghost" size="xs" onClick={onEditProfile} className="gap-1.5">
                <Edit className="h-3.5 w-3.5" /> Edit Details
              </Button>
            )}
          </div>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail icon={User} label="Full name">{fullName}</Detail>
            <Detail icon={Mail} label="Email">{userProfile?.email}</Detail>
            <Detail icon={CreditCard} label="NIC"><span className="tabular">{userProfile?.nicNumber}</span></Detail>
            <Detail icon={Phone} label="Phone"><span className="tabular">{userProfile?.phoneNumber}</span></Detail>
            <Detail icon={MapPin} label="Address" wide>{userProfile?.address}</Detail>
          </dl>
        </div>

        <Button onClick={handleCheckStatus} loading={checking} disabled={loading} size="lg" className="mt-6 w-full gap-2">
          <RefreshCw className="h-4 w-4" />
          Check Approval Status
        </Button>
      </div>
    </div>
  )
}
