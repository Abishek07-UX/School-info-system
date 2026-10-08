import { cn } from "@/lib/utils"

/** Friendly placeholder for empty lists, missing selections and no-result filters. */
export function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-8" : "gap-3 py-14",
        className
      )}
    >
      {Icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="space-y-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        {description && <p className="mx-auto max-w-sm text-[13px] text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** A table row that spans every column and centers an EmptyState (or any children). */
export function TableEmptyRow({ colSpan, children, ...props }) {
  return (
    <tr className="hover:bg-transparent">
      <td colSpan={colSpan}>{children ?? <EmptyState compact {...props} />}</td>
    </tr>
  )
}
