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
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#1f1f21] border-[0.5px] border-white/10 text-[#ea580c]">
            <Clock className="h-6 w-6" />
          </div>

          <div className="flex justify-center mb-2">
            <Badge variant="warning" className="font-normal">
              Status: Awaiting Role Assignment
            </Badge>
          </div>

          <CardTitle className="text-xl font-normal tracking-tight text-[#ffffff]">
            Registration Submitted, {fullName}
          </CardTitle>
          <CardDescription className="text-xs text-[#858687] max-w-md mx-auto">
            Your staff identification details are logged in the school database. An Administrator will review your credentials and assign your operational role.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Submitted Staff Summary Record */}
          <div className="rounded-[10px] border-[0.5px] border-white/10 bg-[#1f1f21] p-4">
            <div className="flex items-center justify-between border-b-[0.5px] border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-white">
                <UserCheck className="h-3.5 w-3.5 text-[#3b82f6]" />
                Submitted Staff Record
              </div>
              {onEditProfile && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onEditProfile}
                  className="gap-1 text-xs text-[#3b82f6] hover:text-white"
                >
                  <Edit className="h-3 w-3" /> Edit Details
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <span className="text-[#858687] flex items-center gap-1.5 text-[11px]">
                  <UserCheck className="h-3 w-3 text-[#858687]" /> Full Name
                </span>
                <div className="text-[#ffffff] font-normal">{fullName}</div>
              </div>

              <div className="space-y-1">
                <span className="text-[#858687] flex items-center gap-1.5 text-[11px]">
                  <Mail className="h-3 w-3 text-[#858687]" /> Official Email
                </span>
                <div className="text-[#ffffff] font-normal truncate">
                  {userProfile?.email || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#858687] flex items-center gap-1.5 text-[11px]">
                  <CreditCard className="h-3 w-3 text-[#858687]" /> National ID (NIC)
                </span>
                <div className="font-mono text-[#ffffff]">
                  {userProfile?.nicNumber || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#858687] flex items-center gap-1.5 text-[11px]">
                  <Phone className="h-3 w-3 text-[#858687]" /> Phone Number
                </span>
                <div className="text-[#ffffff] font-normal">
                  {userProfile?.phoneNumber || "N/A"}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1 pt-2 border-t-[0.5px] border-white/[0.05]">
                <span className="text-[#858687] flex items-center gap-1.5 text-[11px]">
                  <MapPin className="h-3 w-3 text-[#858687]" /> Residential Address
                </span>
                <div className="text-[#cececf]">
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

          <p className="text-center text-[11px] text-[#858687] leading-relaxed">
            Once an Administrator assigns your role in User Management, checking approval status will unlock your operational modules.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
