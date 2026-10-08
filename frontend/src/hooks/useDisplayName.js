import { useUser } from "@clerk/react"
import { useAuthUser } from "@/context/AuthUserContext"

/** Name, initials, avatar and email for the signed-in staff member. */
export function useDisplayName() {
  const { user } = useUser()
  const { userProfile } = useAuthUser()
  const displayName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName || ""}`.trim()
    : user?.firstName || "Staff Member"
  const initials =
    (userProfile?.firstName?.[0] || user?.firstName?.[0] || "S") +
    (userProfile?.lastName?.[0] || user?.lastName?.[0] || "M")
  return { displayName, initials, imageUrl: user?.imageUrl, email: user?.primaryEmailAddress?.emailAddress || userProfile?.email }
}
