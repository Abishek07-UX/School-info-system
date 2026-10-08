/* eslint-disable react-refresh/only-export-components */
// Minimal History-API router. The exported names and shapes mirror react-router
// (useNavigate, useLocation, useParams, Link, NavLink, Navigate, useRoutes,
// useBlocker) so the app can switch to react-router later by changing imports.
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"

const RouterContext = createContext(null)
const RouteContext = createContext({ params: {} })

function readLocation() {
  const { pathname, search, hash } = window.location
  return { pathname, search, hash, state: window.history.state?.usr ?? null, key: window.history.state?.key ?? "default" }
}

let keyCounter = 0
const nextKey = () => `k${Date.now().toString(36)}${(keyCounter++).toString(36)}`

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(readLocation)
  const blockers = useRef(new Set())
  const locationRef = useRef(location)
  useLayoutEffect(() => {
    locationRef.current = location
  }, [location])

  // Ask every active blocker; resolves true when navigation may continue
  const confirmLeave = useCallback(async () => {
    for (const blocker of blockers.current) {
      if (blocker.when()) {
        const proceed = await blocker.onBlock()
        if (!proceed) return false
      }
    }
    return true
  }, [])

  const navigate = useCallback(
    async (to, { replace = false, state = null } = {}) => {
      if (typeof to === "number") {
        window.history.go(to)
        return
      }
      const url = new URL(to, window.location.href)
      const current = locationRef.current
      if (url.pathname === current.pathname && url.search === current.search && !state) return
      if (!(await confirmLeave())) return
      const entry = { usr: state, key: nextKey() }
      if (replace) window.history.replaceState(entry, "", url.pathname + url.search + url.hash)
      else window.history.pushState(entry, "", url.pathname + url.search + url.hash)
      setLocation(readLocation())
      if (!replace) window.scrollTo({ top: 0 })
    },
    [confirmLeave]
  )

  useEffect(() => {
    const onPop = async () => {
      const target = readLocation()
      const hasActiveBlocker = [...blockers.current].some((b) => b.when())
      if (!hasActiveBlocker) {
        setLocation(target)
        return
      }
      // Put the user back where they were while we ask, then follow through if they agree
      const current = locationRef.current
      window.history.pushState({ usr: current.state, key: current.key }, "", current.pathname + current.search + current.hash)
      if (await confirmLeave()) {
        window.history.pushState({ usr: target.state, key: nextKey() }, "", target.pathname + target.search + target.hash)
        setLocation(readLocation())
      }
    }
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [confirmLeave])

  const registerBlocker = useCallback((blocker) => {
    blockers.current.add(blocker)
    return () => blockers.current.delete(blocker)
  }, [])

  const value = useMemo(() => ({ location, navigate, registerBlocker }), [location, navigate, registerBlocker])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

function useRouter() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error("Router hooks must be used inside <BrowserRouter>")
  return ctx
}

export const useLocation = () => useRouter().location
export const useNavigate = () => useRouter().navigate
export const useParams = () => useContext(RouteContext).params

/**
 * Match "/academics/:tab?" style patterns. Returns params or null.
 * With `end: false` the pattern only has to match the start of the path.
 */
export function matchPath(pattern, pathname, { end = true } = {}) {
  const patternParts = pattern.split("/").filter(Boolean)
  const pathParts = pathname.split("/").filter(Boolean)
  if (pattern === "*") return { "*": pathname }
  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i]
    const segment = pathParts[i]
    if (part.startsWith(":")) {
      const optional = part.endsWith("?")
      const name = part.slice(1, optional ? -1 : undefined)
      if (segment === undefined) {
        if (optional) continue
        return null
      }
      params[name] = decodeURIComponent(segment)
    } else if (part !== segment) {
      return null
    }
  }
  if (end && pathParts.length > patternParts.length) return null
  return params
}

/** routes: [{ path, element }] — first match wins; use path "*" as a fallback. */
export function useRoutes(routes) {
  const { pathname } = useLocation()
  for (const route of routes) {
    const params = matchPath(route.path, pathname)
    if (params) {
      return <RouteContext.Provider value={{ params }}>{route.element}</RouteContext.Provider>
    }
  }
  return null
}

function isModifiedClick(event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey || event.button !== 0
}

export function Link({ to, replace, state, onClick, target, children, ...props }) {
  const navigate = useNavigate()
  return (
    <a
      href={to}
      target={target}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || isModifiedClick(event) || (target && target !== "_self")) return
        event.preventDefault()
        navigate(to, { replace, state })
      }}
      {...props}
    >
      {children}
    </a>
  )
}

/** Link that knows whether it's active. `className`/`children` may be functions of { isActive }. */
export function NavLink({ to, end = false, className, children, ...props }) {
  const { pathname } = useLocation()
  const isActive = Boolean(matchPath(to, pathname, { end })) || (!end && to !== "/" && pathname.startsWith(`${to}/`))
  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={typeof className === "function" ? className({ isActive }) : className}
      {...props}
    >
      {typeof children === "function" ? children({ isActive }) : children}
    </Link>
  )
}

export function Navigate({ to, replace = true, state }) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to, { replace, state })
  }, [navigate, to, replace, state])
  return null
}

/**
 * Guard in-app navigation (and tab close/refresh) while `when` is true.
 * `onBlock` returns a promise resolving to true to allow leaving.
 */
export function useBlocker(when, onBlock) {
  const { registerBlocker } = useRouter()
  const whenRef = useRef(when)
  const onBlockRef = useRef(onBlock)
  useEffect(() => {
    whenRef.current = when
    onBlockRef.current = onBlock
  })

  useEffect(
    () =>
      registerBlocker({
        when: () => whenRef.current,
        onBlock: () => onBlockRef.current(),
      }),
    [registerBlocker]
  )

  useEffect(() => {
    if (!when) return
    const onBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [when])
}
