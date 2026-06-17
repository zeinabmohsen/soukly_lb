"use client"

import { useEffect, useRef } from "react"
import { useRefreshSessionMutation } from "@/store/api/authApi"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import {
  setCredentials,
  finishHydration,
  selectAccessToken,
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
  // Whether we already booted with a (long-lived, persisted) access token.
  // Captured at mount; if true the refresh below is a best-effort renewal and a
  // failure must NOT log us out.
  const hadTokenAtBoot = useAppSelector((s) => !!selectAccessToken(s))
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
        // Only clear the stored user on a definitive auth failure AND only when
        // we don't already hold a valid persisted token. With long-lived tokens
        // the boot refresh is just a renewal — a dead refresh cookie shouldn't
        // log out a user whose access token is still good. A network error/5xx
        // (ok:true) also keeps the optimistic user.
        dispatch(finishHydration({ ok: !authFailure || hadTokenAtBoot }))
      })
  }, [refreshSession, dispatch, hadTokenAtBoot])

  return null
}
