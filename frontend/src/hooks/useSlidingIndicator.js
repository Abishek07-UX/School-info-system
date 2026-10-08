import { useLayoutEffect, useRef, useState } from "react"

/**
 * Tracks the position of the active item inside a container so a single indicator
 * element can slide between items (tabs, segmented controls, nav).
 *
 * The active item is found with `activeSelector`; the hook re-measures on resize and
 * whenever attributes inside the container change (e.g. Radix's data-state).
 * Returns [containerRef, style, rect] — spread `style` onto the indicator element, or build
 * a custom style from `rect` ({ left, top, width, height, animate }).
 */
export function useSlidingIndicator(activeSelector, deps = []) {
  const containerRef = useRef(null)
  const [rect, setRect] = useState(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const measure = () => {
      const active = container.querySelector(activeSelector)
      if (!active) {
        setRect(null)
        return
      }
      const next = {
        left: active.offsetLeft,
        top: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      }
      // Only slide once there's a previous position; the first placement is instant
      setRect((prev) => ({ ...next, animate: prev !== null }))
    }

    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(container)
    container.querySelectorAll(":scope > *").forEach((el) => resize.observe(el))
    const mutations = new MutationObserver(measure)
    mutations.observe(container, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state", "aria-selected", "aria-checked", "aria-current"],
    })
    return () => {
      resize.disconnect()
      mutations.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSelector, ...deps])

  const style = rect
    ? {
        width: rect.width,
        height: rect.height,
        transform: `translate(${rect.left}px, ${rect.top}px)`,
        opacity: 1,
        transition: rect.animate
          ? "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1), height 280ms cubic-bezier(0.22, 1, 0.36, 1)"
          : "none",
      }
    : { opacity: 0 }

  return [containerRef, style, rect]
}
