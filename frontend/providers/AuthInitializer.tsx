"use client"

import { useEffect } from "react"
import { useGetMeQuery } from "@/store/api/authApi"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import {
  selectAccessToken,
  selectIsHydrating,
  setCredentials,
  finishHydration,
} from "@/store/slices/authSlice"

/**
 * Runs once on mount and reconciles the persisted user with the server.
 *
 * On first paint, authSlice may have a `user` loaded from localStorage but no
 * accessToken (it's memory-only). We call /auth/me, which triggers the
 * pre-emptive refresh in baseApi via the refresh cookie. If the cookie is still
 * valid, we get a fresh user + token and the app is logged in. If the cookie
 * has expired since the last visit, /auth/me returns 401 and we clear the stale
 * local user via finishHydration({ ok: false }).
 *
 * Until this resolves, `isHydrating` stays true and selectIsAuthenticated returns
 * false, so the UI doesn't briefly show "logged in" before flipping to "logged
 * out" when the cookie turns out to be dead.
 */
export function AuthInitializer() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)
  const isHydrating = useAppSelector(selectIsHydrating)
  const { data, isLoading, isError, error } = useGetMeQuery()

  useEffect(() => {
    if (isLoading) return

    if (data?.user && accessToken) {
      // Successful hydration: fresh user + valid token (token came from a
      // pre-emptive refresh inside baseApi if the original was expired).
      dispatch(setCredentials({ user: data.user, accessToken }))
      return
    }

    if (isHydrating) {
      // /auth/me failed. ONLY treat a definitive 401 as "logged out" — that
      // means the refresh cookie is gone/expired and the session is truly dead,
      // so we clear the stale stored user. A network error or 5xx (e.g. the
      // backend cold-starting on Render's free tier) must NOT log the user out:
      // keep the optimistic user from localStorage and let a later request
      // recover the token. baseApi already does a 401→refresh→retry, so if we
      // still see 401 here the refresh genuinely failed.
      const status = (error as { status?: number | string } | undefined)?.status
      const definitivelyUnauthorized = status === 401
      dispatch(finishHydration({ ok: !definitivelyUnauthorized }))
    }
  }, [data, accessToken, isLoading, isError, error, isHydrating, dispatch])

  return null
}
