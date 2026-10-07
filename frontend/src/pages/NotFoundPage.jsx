import { Compass } from "lucide-react"
import { Link } from "@/lib/router"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="This page doesn't exist"
      description="The link may be out of date, or the page may have moved. Head back to the overview to find what you need."
      className="py-24"
      action={
        <Button asChild size="sm">
          <Link to="/">Go to overview</Link>
        </Button>
      }
    />
  )
}
