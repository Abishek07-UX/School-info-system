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
import { Ban, RefreshCw } from "lucide-react"

export default function DeactivatedAccountView() {
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
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-surface-2 border border-border text-danger">
            <Ban className="h-6 w-6" />
          </div>

          <div className="flex justify-center mb-2">
            <Badge variant="destructive" className="font-normal">
              Status: Account Deactivated
            </Badge>
          </div>

          <CardTitle className="text-xl font-normal tracking-tight text-foreground">
            Your account is deactivated, {fullName}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto">
            An Administrator has deactivated this staff account, so school records are not available.
            Contact an Administrator if you need access again.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            onClick={handleCheckStatus}
            disabled={checking || loading}
            size="lg"
            variant="outline"
            className="w-full gap-2 text-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
            {checking ? "Checking Account Status..." : "Check Account Status"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
