import { cn } from "@/lib/utils"

/**
 * Standard page/section header: optional eyebrow, title, description and actions.
 * `as` lets nested sections use h2/h3 while keeping the same layout.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  actions,
  as: Heading = "h1",
  className,
  children,
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {eyebrow && (
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
        )}
        <Heading
          className={cn(
            "flex items-center gap-2.5 text-foreground",
            Heading === "h1" ? "text-display" : "text-title"
          )}
        >
          {Icon && <Icon className={cn("shrink-0 text-accent-blue", Heading === "h1" ? "h-6 w-6" : "h-5 w-5")} />}
          <span className="min-w-0">{title}</span>
        </Heading>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
