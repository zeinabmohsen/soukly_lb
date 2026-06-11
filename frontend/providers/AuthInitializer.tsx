"use client"

import { useEffect, useRef } from "react"
import { useRefreshSessionMutation } from "@/store/api/authApi"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import {
  setCredentials,
  finishHydration,
} from "@/store/slices/authSlice"

/**
 * Runs once on mount and reconciles the persisted user with the server.
 *
 * On first paint, authSlice may have a `user` loaded from localStorage but no
 * accessToken (it's memory-only). We hit /auth/refresh ONCE — it reads the
 * httpOnly refresh cookie and, if it's still valid, returns a fresh user + a
 * new access token in a single round-trip. (The old approach called /auth/me
 * first, which was guaranteed to 401 since there's never a token at boot, then
 * refreshed, then retried /auth/me — three requests for what refresh does in
 * one.)
 *
 * Until this resolves, `isHydrating` stays true and selectIsAuthenticated is
 * treated cautiously by auth-gated pages, so the UI doesn't flash "logged in"
 * before flipping to "logged out" when the cookie turns out to be dead.
 *
 * Failure handling: only a definitive auth failure (400/401 — the cookie is
 * gone/expired/invalid) clears the stale stored user. A network error or 5xx
 * (e.g. the backend cold-starting on Render's free tier) keeps the optimistic
 * user from localStorage so a transient blip doesn't log anyone out.
 */
export function AuthInitializer() {
  const dispatch = useAppDispatch()
  const [refreshSession] = useRefreshSessionMutation()
  const ranRef = useRef(false)

  useEffect(() => {
    // StrictMode mounts effects twice in dev; guard so we only fire once.
    if (ranRef.current) return
    ranRef.current = true

    refreshSession()
      .unwrap()
      .then(({ user, access_token }) => {
        dispatch(setCredentials({ user, accessToken: access_token }))
      })
      .catch((err: { status?: number | string }) => {
        const status = err?.status
        const authFailure = status === 401 || status === 400
        // ok:true keeps any optimistic stored user (transient failure);
        // ok:false clears it (definitively unauthenticated).
        dispatch(finishHydration({ ok: !authFailure }))
      })
  }, [refreshSession, dispatch])

  return null
}
