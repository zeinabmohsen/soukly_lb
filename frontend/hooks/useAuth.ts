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

  const logout = () => dispatch(logoutAction())

  const logoutAsync = async () => {
    try { await triggerLogout().unwrap() } catch { /* best effort */ }
    dispatch(logoutAction())
  }

  return { user, isAuthenticated, isSeller, isAdmin, isHydrating, logout, logoutAsync }
}
