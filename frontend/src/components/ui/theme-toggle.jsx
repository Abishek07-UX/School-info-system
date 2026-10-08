import { useRef } from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

/** Light / Dark / System picker. The icon spins into place when the theme changes. */
export function ThemeToggle({ className, showLabel = false }) {
  const { mode, resolvedTheme, setMode } = useTheme()
  const iconRef = useRef(null)
  const isFirst = useRef(true)

  useGSAP(
    () => {
      if (isFirst.current) {
        isFirst.current = false
        return
      }
      if (prefersReducedMotion() || !iconRef.current) return
      gsap.fromTo(
        iconRef.current,
        { rotate: -90, scale: 0.5, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(2)" }
      )
    },
    { dependencies: [resolvedTheme] }
  )

  const Icon = resolvedTheme === "dark" ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Theme: ${mode}`}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-[9px] px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
          className
        )}
      >
        <span ref={iconRef} className="inline-flex">
          <Icon className="h-4 w-4" />
        </span>
        {showLabel && <span>{OPTIONS.find((o) => o.value === mode)?.label} theme</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={mode} onValueChange={setMode}>
          {OPTIONS.map(({ value, label, icon: OptionIcon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="gap-2">
              <OptionIcon className="h-3.5 w-3.5 text-muted-foreground" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
