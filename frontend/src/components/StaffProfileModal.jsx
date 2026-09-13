import { useState, useEffect } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { useUser } from "@clerk/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  User,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react"

export default function StaffProfileModal({ isOpen, onClose, required = false }) {
  const { userProfile, updateProfile, role } = useAuthUser()
  const { user: clerkUser } = useUser()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nicNumber: "",
    address: "",
  })
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || clerkUser?.firstName || "",
        lastName: userProfile.lastName || clerkUser?.lastName || "",
        email:
          !userProfile.email || userProfile.email.endsWith("@placeholder.com")
            ? clerkUser?.primaryEmailAddress?.emailAddress || ""
            : userProfile.email,
        phoneNumber:
          userProfile.phoneNumber || clerkUser?.primaryPhoneNumber?.phoneNumber || "",
        nicNumber: userProfile.nicNumber || "",
        address: userProfile.address || "",
      })
    }
  }, [userProfile, clerkUser])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      if (!formData.email || !formData.email.includes("@")) {
        throw new Error("Please enter a valid official email address.")
      }
      let cleanPhone = formData.phoneNumber
      if (formData.phoneNumber) {
        cleanPhone = formData.phoneNumber.trim().replaceAll(/[\s\-()]/g, "")
        if (!/^[0-9]{10}$/.test(cleanPhone)) {
          throw new Error(
            "Phone number must contain exactly 10 digits with no special symbols (e.g. 0771234567)."
          )
        }
      }

      if (!formData.nicNumber || !formData.nicNumber.trim()) {
        throw new Error("National Identity Card (NIC) number is required.")
      }

      const cleanNic = formData.nicNumber.trim().toUpperCase()
      if (!/^([0-9]{12}|[0-9]{9}V)$/.test(cleanNic)) {
        throw new Error(
          "NIC number must be either 12 digits (e.g. 199012345678) or 9 digits followed by 'V' (e.g. 901234567V)."
        )
      }

      await updateProfile({
        ...formData,
        phoneNumber: cleanPhone,
        nicNumber: cleanNic,
      })
      setSuccessMsg("Staff profile details updated successfully!")
      setTimeout(() => {
        if (onClose) onClose()
      }, 1200)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={!required ? onClose : undefined}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-heading">
                {required ? "Complete Staff Profile" : "Staff Profile & Credentials"}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Role: {role}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  ID: {userProfile?.id ? `#${userProfile.id}` : "Registered"}
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-slate-400 text-xs mt-2">
            View and update your registered identification and contact details in the school operational database.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="my-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" className="my-2">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 my-2">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="prof-firstName">First Name *</Label>
              <Input
                id="prof-firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="e.g. John"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="prof-lastName">Last Name *</Label>
              <Input
                id="prof-lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="e.g. Silva"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="prof-email">Official Email Address *</Label>
            <Input
              id="prof-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. john.silva@school.lk"
            />
          </div>

          {/* Phone & NIC */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="prof-phone">Phone Number (10 Digits) *</Label>
              <Input
                id="prof-phone"
                type="tel"
                required
                maxLength={10}
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phoneNumber: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                placeholder="e.g. 0771234567"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="prof-nic">National ID (NIC) *</Label>
              <Input
                id="prof-nic"
                type="text"
                required
                value={formData.nicNumber}
                onChange={(e) =>
                  setFormData({ ...formData, nicNumber: e.target.value.toUpperCase() })
                }
                placeholder="e.g. 199012345678"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label htmlFor="prof-address">Residential Address *</Label>
            <Textarea
              id="prof-address"
              required
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. No. 45, Temple Road, Colombo"
            />
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            {!required && onClose && (
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Profile Details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
