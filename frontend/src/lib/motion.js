// Shared GSAP motion presets. Every preset respects the OS "reduce motion" setting by
// jumping straight to the end state, and none of them block pointer input.
import { gsap } from "gsap"
import { Flip } from "gsap/Flip"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(useGSAP, Flip)
gsap.defaults({ ease: "power3.out", duration: 0.24 })

export { gsap, Flip, useGSAP }

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const MAX_STAGGERED = 12

/** Fade in while rising a few pixels — route and panel entrances. */
export function fadeRise(targets, { y = 8, delay = 0, stagger = 0, duration = 0.32 } = {}) {
  if (prefersReducedMotion()) return gsap.set(targets, { opacity: 1, y: 0 })
  return gsap.fromTo(
    targets,
    { opacity: 0, y },
    { opacity: 1, y: 0, delay, stagger, duration, clearProps: "transform,opacity" }
  )
}

/** Staggered entrance for cards and rows; anything past the first dozen appears instantly. */
export function staggerIn(targets, { y = 10, delay = 0, each = 0.04 } = {}) {
  const items = gsap.utils.toArray(targets)
  if (!items.length) return null
  const animated = items.slice(0, MAX_STAGGERED)
  if (prefersReducedMotion()) return gsap.set(items, { opacity: 1, y: 0 })
  return gsap.fromTo(
    animated,
    { opacity: 0, y },
    { opacity: 1, y: 0, delay, duration: 0.36, stagger: each, clearProps: "transform,opacity" }
  )
}

/** Count a number up from zero. Keeps thousands separators and any suffix in `format`. */
export function countUp(el, to, { duration = 0.9, format = (n) => Math.round(n).toLocaleString() } = {}) {
  if (!el) return null
  if (prefersReducedMotion() || !Number.isFinite(to)) {
    el.textContent = format(to)
    return null
  }
  const counter = { value: 0 }
  return gsap.to(counter, {
    value: to,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = format(counter.value)
    },
  })
}

/** Small horizontal shake for invalid input. */
export function shake(el) {
  if (!el || prefersReducedMotion()) return null
  return gsap.fromTo(
    el,
    { x: 0 },
    { x: 0, duration: 0.36, ease: "none", keyframes: { x: [0, -4, 4, -3, 3, -1, 0] }, clearProps: "transform" }
  )
}

/** Brief background pulse on a row/cell to confirm it was saved. */
export function flash(el, color = "var(--success-soft)") {
  if (!el) return null
  if (prefersReducedMotion()) return null
  return gsap.fromTo(
    el,
    { backgroundColor: color },
    { backgroundColor: "transparent", duration: 1.1, ease: "power1.out", clearProps: "backgroundColor" }
  )
}

/** Draw an SVG stroke (e.g. a success tick). */
export function drawStroke(path, { duration = 0.4, delay = 0 } = {}) {
  if (!path) return null
  const length = path.getTotalLength?.() ?? 24
  if (prefersReducedMotion()) return gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0 })
  return gsap.fromTo(
    path,
    { strokeDasharray: length, strokeDashoffset: length },
    { strokeDashoffset: 0, duration, delay, ease: "power2.out" }
  )
}

/** Slide-in for side drawers. `from` is "left" | "right". */
export function slideIn(el, { from = "left", duration = 0.3 } = {}) {
  if (!el) return null
  const xPercent = from === "left" ? -100 : 100
  if (prefersReducedMotion()) return gsap.set(el, { xPercent: 0 })
  return gsap.fromTo(el, { xPercent }, { xPercent: 0, duration, ease: "power3.out" })
}
