import { useState } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  RefreshCw,
  Edit,
  UserCheck,
  Mail,
  Phone,
  CreditCard,
  MapPin,
} from "lucide-react"

export default function PendingApprovalView({ onEditProfile }) {
  const { userProfile, refreshUser, loading } = useAuthUser()
  const [checking, setChecking] = useState(false)

  const handleCheckStatus = async () => {
    setChecking(true)
    await refreshUser()
    setChecking(false)
  }

  const fullName =
    `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim() ||
    "Staff Member"

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <Card className="p-2">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-surface-2 border border-border text-warning">
            <Clock className="h-6 w-6" />
          </div>

          <div className="flex justify-center mb-2">
            <Badge variant="warning" className="font-normal">
              Status: Awaiting Role Assignment
            </Badge>
          </div>

          <CardTitle className="text-xl font-normal tracking-tight text-foreground">
            Registration Submitted, {fullName}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto">
            Your staff identification details are logged in the school database. An Administrator will review your credentials and assign your operational role.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Submitted Staff Summary Record */}
          <div className="rounded-[10px] border border-border bg-surface-2 p-4">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <UserCheck className="h-3.5 w-3.5 text-accent-blue" />
                Submitted Staff Record
              </div>
              {onEditProfile && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onEditProfile}
                  className="gap-1 text-xs text-accent-blue hover:text-foreground"
                >
                  <Edit className="h-3 w-3" /> Edit Details
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <UserCheck className="h-3 w-3 text-muted-foreground" /> Full Name
                </span>
                <div className="text-foreground font-normal">{fullName}</div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Mail className="h-3 w-3 text-muted-foreground" /> Official Email
                </span>
                <div className="text-foreground font-normal truncate">
                  {userProfile?.email || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <CreditCard className="h-3 w-3 text-muted-foreground" /> National ID (NIC)
                </span>
                <div className="font-mono text-foreground">
                  {userProfile?.nicNumber || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Phone className="h-3 w-3 text-muted-foreground" /> Phone Number
                </span>
                <div className="text-foreground font-normal">
                  {userProfile?.phoneNumber || "N/A"}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1 pt-2 border-t border-border">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <MapPin className="h-3 w-3 text-muted-foreground" /> Residential Address
                </span>
                <div className="text-foreground-2">
                  {userProfile?.address || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCheckStatus}
            disabled={checking || loading}
            size="lg"
            className="w-full gap-2 text-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Verifying Approval Status..." : "Check Approval Status"}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            Once an Administrator assigns your role in User Management, checking approval status will unlock your operational modules.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
