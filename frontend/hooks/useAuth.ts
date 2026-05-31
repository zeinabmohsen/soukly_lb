"use client"

import { useAppSelector } from "./useAppSelector"
import { useAppDispatch } from "./useAppDispatch"
import {
  selectUser,
  selectIsAuthenticated,
  selectIsSeller,
  selectIsAdmin,
  selectIsHydrating,
  logout as logoutAction,
} from "@/store/slices/authSlice"
import { useLogoutUserMutation } from "@/store/api/authApi"
import { baseApi } from "@/store/api/baseApi"

export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isSeller = useAppSelector(selectIsSeller)
  const isAdmin = useAppSelector(selectIsAdmin)
  // True until /auth/me has confirmed the cached user is still valid.
  // Auth-gated pages that redirect on `!isAuthenticated` should wait for
  // `!isHydrating` before deciding, otherwise they'll spuriously kick a
  // freshly-loaded user to /login on every page load.
  const isHydrating = useAppSelector(selectIsHydrating)
  const [triggerLogout] = useLogoutUserMutation()

  // Clear auth state AND every cached query (orders, admin lists, wishlist…)
  // so no previous-user data lingers for the next person on this browser.
  const clearSession = () => {
    dispatch(logoutAction())
    dispatch(baseApi.util.resetApiState())
  }

  const logout = () => clearSession()

  const logoutAsync = async () => {
    // Tell the server to destroy the session + clear the refresh cookie first,
    // then wipe local state regardless of whether that call succeeded.
    try { await triggerLogout().unwrap() } catch { /* best effort */ }
    clearSession()
  }

  return { user, isAuthenticated, isSeller, isAdmin, isHydrating, logout, logoutAsync }
}
