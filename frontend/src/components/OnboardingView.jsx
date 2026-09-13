import { useState, useEffect } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { useUser } from "@clerk/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  UserCheck,
  Phone,
  CreditCard,
  MapPin,
  Mail,
  AlertCircle,
  Sparkles,
  ArrowRight,
  User,
} from "lucide-react"

export default function OnboardingView() {
  const { userProfile, updateProfile, refreshUser } = useAuthUser()
  const { user: clerkUser } = useUser()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nicNumber: "",
    address: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    setFormData({
      firstName: userProfile?.firstName || clerkUser?.firstName || "",
      lastName: userProfile?.lastName || clerkUser?.lastName || "",
      email:
        userProfile?.email && !userProfile.email.endsWith("@placeholder.com")
          ? userProfile.email
          : clerkUser?.primaryEmailAddress?.emailAddress || "",
      phoneNumber:
        userProfile?.phoneNumber || clerkUser?.primaryPhoneNumber?.phoneNumber || "",
      nicNumber: userProfile?.nicNumber || "",
      address: userProfile?.address || "",
    })
  }, [userProfile, clerkUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    try {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error("First name and Last name are mandatory.")
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        throw new Error("A valid official email address is required.")
      }
      const cleanPhone = formData.phoneNumber.trim().replaceAll(/[\s\-()]/g, "")
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        throw new Error(
          "Phone number must contain exactly 10 digits with no special characters (e.g., 0771234567)."
        )
      }

      const cleanNic = formData.nicNumber.trim().toUpperCase()
      if (!/^([0-9]{12}|[0-9]{9}V)$/.test(cleanNic)) {
        throw new Error(
          "NIC number must be either 12 digits (e.g. 199012345678) or 9 digits followed by 'V' (e.g. 901234567V)."
        )
      }

      if (!formData.address.trim()) {
        throw new Error("Residential address is required for official staff records.")
      }

      await updateProfile({
        ...formData,
        phoneNumber: cleanPhone,
        nicNumber: cleanNic,
      })
      await refreshUser()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Card className="border-white/10 shadow-2xl overflow-hidden relative">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
            <UserCheck className="h-7 w-7 text-white" />
          </div>

          <div className="flex justify-center mb-2">
            <Badge variant="default" className="text-xs px-3 py-1 font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Step 1 of 2: Staff Identification
            </Badge>
          </div>

          <CardTitle className="text-2xl font-bold font-heading">
            Complete Your Staff Registration
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm max-w-lg mx-auto">
            Please register your official identity credentials. Once submitted, your profile will be queued for Administrator verification and role assignment.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <Alert variant="destructive" className="mb-6 animate-in fade-in-0 zoom-in-95">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  First Name <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  placeholder="e.g. Ruwan"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  Last Name <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  placeholder="e.g. Perera"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email">
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
                Official Email Address <span className="text-rose-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="e.g. ruwan.perera@school.lk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Phone & NIC */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                  Phone Number (10 Digits) <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 0771234567"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phoneNumber: e.target.value.replace(/[^0-9]/g, ""),
                    })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nicNumber">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                  National ID (NIC) <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="nicNumber"
                  type="text"
                  required
                  placeholder="e.g. 199012345678 or 901234567V"
                  value={formData.nicNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, nicNumber: e.target.value.toUpperCase() })
                  }
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address">
                <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                Residential Address <span className="text-rose-400">*</span>
              </Label>
              <Textarea
                id="address"
                required
                rows={3}
                placeholder="e.g. No. 120, Kandy Road, Colombo"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full gap-2 text-base font-bold shadow-indigo-500/20"
              >
                {submitting ? (
                  <>Saving Registration Details...</>
                ) : (
                  <>
                    Submit & Proceed to Approval Queue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
