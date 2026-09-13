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
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-14">
      <Card className="border-amber-500/20 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 border-2 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
            <Clock className="h-8 w-8 animate-pulse" />
          </div>

          <div className="flex justify-center mb-2">
            <Badge variant="warning" className="text-xs px-3 py-1 font-semibold">
              Status: Awaiting Administrator Role Assignment
            </Badge>
          </div>

          <CardTitle className="text-2xl font-bold font-heading">
            Registration Submitted, {fullName}!
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm max-w-lg mx-auto">
            Your staff identification details are securely logged in the school database. An Administrator will review your verified details and assign your appropriate role (Teacher, Finance Staff, Principal, or Admin).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Submitted Staff Summary Record */}
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <UserCheck className="h-4 w-4 text-indigo-400" />
                Submitted Staff Record
              </div>
              {onEditProfile && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onEditProfile}
                  className="gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <Edit className="h-3 w-3" /> Edit Details
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-slate-500" /> Full Name
                </span>
                <div className="font-semibold text-slate-100 text-sm">{fullName}</div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" /> Official Email
                </span>
                <div className="font-semibold text-indigo-300 truncate">
                  {userProfile?.email || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-slate-500" /> National ID (NIC)
                </span>
                <div className="font-mono font-semibold text-amber-300">
                  {userProfile?.nicNumber || "N/A"}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-500" /> Phone Number
                </span>
                <div className="font-semibold text-slate-100">
                  {userProfile?.phoneNumber || "N/A"}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1 pt-1 border-t border-white/5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" /> Residential Address
                </span>
                <div className="text-slate-300">
                  {userProfile?.address || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCheckStatus}
            disabled={checking || loading}
            size="lg"
            className="w-full gap-2 text-base font-bold shadow-indigo-500/20"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Verifying Approval Status..." : "Check Approval Status"}
          </Button>

          <p className="text-center text-xs text-slate-500 leading-relaxed">
            💡 Once an Administrator assigns your role in the User Management console, clicking <strong>"Check Approval Status"</strong> will instantly unlock your modules.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
