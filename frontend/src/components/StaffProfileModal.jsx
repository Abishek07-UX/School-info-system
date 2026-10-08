import { useState, useEffect, useRef } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { useToast } from "@/context/ToastContext"
import { useUser } from "@clerk/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Save } from "lucide-react"
import { ROLE_LABELS } from "@/lib/modules"
import { EMPTY_PROFILE, toProfilePayload, validateStaffProfile } from "@/lib/staffProfile"
import { shake } from "@/lib/motion"
import { StaffProfileFields } from "./common/StaffProfileFields"

const ALL_SHOWN = Object.fromEntries(Object.keys(EMPTY_PROFILE).map((k) => [k, true]))

export default function StaffProfileModal({ isOpen, onClose, required = false }) {
  const { userProfile, updateProfile, role } = useAuthUser()
  const { user: clerkUser } = useUser()
  const toast = useToast()

  const [formData, setFormData] = useState(EMPTY_PROFILE)
  const [shown, setShown] = useState({})
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const formRef = useRef(null)

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
  }, [userProfile, clerkUser, isOpen])

  // Start each opening fresh
  useEffect(() => {
    if (isOpen) {
      setShown({})
      setErrorMsg(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const errors = validateStaffProfile(formData)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (Object.keys(errors).length > 0) {
      setShown(ALL_SHOWN)
      shake(formRef.current)
      const first = Object.keys(EMPTY_PROFILE).find((name) => errors[name])
      formRef.current?.querySelector(`[name="${first}"]`)?.focus()
      return
    }

    setSaving(true)
    try {
      await updateProfile(toProfilePayload(formData))
      toast.success("Staff profile details updated successfully.")
      onClose?.()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={!required ? onClose : undefined}>
      <DialogContent className="max-w-lg" hideClose={required}>
        <DialogHeader>
          <DialogTitle>{required ? "Complete Staff Profile" : "Your profile"}</DialogTitle>
          <DialogDescription>
            Keep your contact and identity details up to date for school records.
          </DialogDescription>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="secondary">{ROLE_LABELS[role] || role}</Badge>
            {userProfile?.id && <Badge variant="outline" className="tabular">Staff #{userProfile.id}</Badge>}
          </div>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>We couldn't save your profile</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
          <StaffProfileFields
            idPrefix="prof-"
            value={formData}
            onChange={setFormData}
            errors={errors}
            shown={shown}
            onBlur={(name) => setShown((s) => ({ ...s, [name]: true }))}
          />

          <DialogFooter>
            {!required && onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={saving} className="gap-2">
              <Save className="h-4 w-4" />
              Save Profile Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
