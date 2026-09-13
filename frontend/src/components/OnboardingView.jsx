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
    <div className="mx-auto max-w-xl px-4 py-12">
      <Card className="p-2">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#1f1f21] border-[0.5px] border-white/10 text-[#3b82f6]">
            <UserCheck className="h-6 w-6" />
          </div>

          <div className="flex justify-center mb-2">
            <Badge variant="default" className="font-normal">
              Step 1 of 2: Staff Identification
            </Badge>
          </div>

          <CardTitle className="text-xl font-normal tracking-tight text-[#ffffff]">
            Complete Staff Registration
          </CardTitle>
          <CardDescription className="text-xs text-[#858687] max-w-md mx-auto">
            Please register your official identity credentials. Once submitted, your profile will be queued for Administrator verification.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMsg && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs text-[#cececf] flex items-center gap-1.5">
                  <User className="h-3 w-3 text-[#858687]" />
                  First Name <span className="text-[#f87171]">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  placeholder="Ruwan"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs text-[#cececf] flex items-center gap-1.5">
                  <User className="h-3 w-3 text-[#858687]" />
                  Last Name <span className="text-[#f87171]">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  placeholder="Perera"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-[#cececf] flex items-center gap-1.5">
                <Mail className="h-3 w-3 text-[#858687]" />
                Official Email Address <span className="text-[#f87171]">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="ruwan.perera@school.lk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Phone & NIC */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs text-[#cececf] flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-[#858687]" />
                  Phone (10 Digits) <span className="text-[#f87171]">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="0771234567"
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
                <Label htmlFor="nicNumber" className="text-xs text-[#cececf] flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3 text-[#858687]" />
                  National ID (NIC) <span className="text-[#f87171]">*</span>
                </Label>
                <Input
                  id="nicNumber"
                  type="text"
                  required
                  placeholder="199012345678 or 901234567V"
                  value={formData.nicNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, nicNumber: e.target.value.toUpperCase() })
                  }
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs text-[#cececf] flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-[#858687]" />
                Residential Address <span className="text-[#f87171]">*</span>
              </Label>
              <Textarea
                id="address"
                required
                rows={3}
                placeholder="No. 120, Kandy Road, Colombo"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full gap-2 text-sm"
              >
                {submitting ? (
                  <>Saving Registration Details...</>
                ) : (
                  <>
                    Submit Registration <ArrowRight className="h-3.5 w-3.5" />
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
