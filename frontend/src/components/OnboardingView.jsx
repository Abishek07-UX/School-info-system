import { useState, useEffect, useRef } from "react"
import { useAuthUser } from "@/context/AuthUserContext"
import { useUser } from "@clerk/react"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowRight, UserCheck } from "lucide-react"
import { EMPTY_PROFILE, toProfilePayload, validateStaffProfile } from "@/lib/staffProfile"
import { shake } from "@/lib/motion"
import { useFadeRise } from "@/hooks/useMotion"
import { RegistrationSteps } from "./common/RegistrationSteps"
import { StaffProfileFields } from "./common/StaffProfileFields"

const ALL_SHOWN = Object.fromEntries(Object.keys(EMPTY_PROFILE).map((k) => [k, true]))

export default function OnboardingView() {
  const { userProfile, updateProfile, refreshUser } = useAuthUser()
  const { user: clerkUser } = useUser()

  const [formData, setFormData] = useState(EMPTY_PROFILE)
  const [shown, setShown] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const formRef = useRef(null)
  const cardRef = useFadeRise([], { y: 12 })

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

  const errors = validateStaffProfile(formData)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg(null)

    if (Object.keys(errors).length > 0) {
      setShown(ALL_SHOWN)
      shake(formRef.current)
      // Move focus to the first field that needs attention
      const first = Object.keys(EMPTY_PROFILE).find((name) => errors[name])
      formRef.current?.querySelector(`[name="${first}"]`)?.focus()
      return
    }

    setSubmitting(true)
    try {
      await updateProfile(toProfilePayload(formData))
      await refreshUser()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <RegistrationSteps current={0} className="mb-8" />

      <div ref={cardRef} className="rounded-[16px] border border-border bg-surface p-6 shadow-pop sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue-soft text-accent-blue">
            <UserCheck className="h-6 w-6" />
          </div>
          <h1 className="text-title text-foreground">Complete Staff Registration</h1>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            Tell us who you are. An administrator checks these details before giving you access.
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle />
            <AlertTitle>We couldn't save your details</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
          <StaffProfileFields
            value={formData}
            onChange={setFormData}
            errors={errors}
            shown={shown}
            onBlur={(name) => setShown((s) => ({ ...s, [name]: true }))}
          />
          <Button type="submit" loading={submitting} size="lg" className="w-full gap-2">
            Submit Registration <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
