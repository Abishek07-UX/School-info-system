import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"

/**
 * Responsive row of filter controls. Shows "Clear filters" when `activeCount` > 0.
 * `summary` (e.g. "24 results") is shown on the right.
 */
export function FilterBar({ children, activeCount = 0, onClear, summary, className }) {
  return (
    <div className={cn("rounded-[12px] border border-border bg-surface p-3 shadow-card", className)}>
      <div className="flex flex-wrap items-end gap-3">
        {children}
        {(onClear || summary) && (
          <div className="ml-auto flex items-center gap-3 self-center">
            {summary && <span className="tabular text-xs text-muted-foreground">{summary}</span>}
            {onClear && activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onClear} className="gap-1.5">
                <X className="h-3.5 w-3.5" />
                Clear {activeCount > 1 ? `${activeCount} filters` : "filter"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Labelled slot inside a FilterBar. */
export function FilterField({ label, htmlFor, hint, className, children }) {
  return (
    <div className={cn("flex min-w-[9rem] flex-1 flex-col gap-1.5 sm:flex-none", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      )}
      {children}
      {hint && <span className="text-[11px] text-muted-foreground/80">{hint}</span>}
    </div>
  )
}

/** Text input with a leading search icon and a clear button. */
export function SearchInput({ value, onChange, placeholder = "Search…", className, ...props }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[6px] p-1 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
