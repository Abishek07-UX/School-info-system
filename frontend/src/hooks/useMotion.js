import { useRef } from "react"
import { useGSAP, fadeRise, staggerIn, countUp } from "@/lib/motion"

/**
 * Fades the element in (rising slightly) on mount and whenever a value in `deps` changes.
 * Returns a ref to attach to the element.
 */
export function useFadeRise(deps = [], options) {
  const ref = useRef(null)
  useGSAP(
    () => {
      if (ref.current) fadeRise(ref.current, options)
    },
    { dependencies: deps }
  )
  return ref
}

/**
 * Staggers the children matching `selector` inside the returned ref's element.
 * Runs on mount and when `deps` change — pass something like a list length or a
 * filter key, never the data array itself, so ordinary re-renders don't replay it.
 */
export function useStaggerIn(selector, deps = [], options) {
  const ref = useRef(null)
  useGSAP(
    () => {
      if (!ref.current) return
      staggerIn(ref.current.querySelectorAll(selector), options)
    },
    { scope: ref, dependencies: deps }
  )
  return ref
}

/** Counts a numeric value up when it first appears or changes. */
export function useCountUp(value, options) {
  const ref = useRef(null)
  useGSAP(
    () => {
      if (ref.current && typeof value === "number") countUp(ref.current, value, options)
    },
    { dependencies: [value] }
  )
  return ref
}
