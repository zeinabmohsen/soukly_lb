"use client"

import { useAppSelector } from "./useAppSelector"
import { useAppDispatch } from "./useAppDispatch"
import {
  selectUser,
  selectIsAuthenticated,
  selectIsSeller,
  selectIsAdmin,
  logout as logoutAction,
} from "@/store/slices/authSlice"
import { useLogoutUserMutation } from "@/store/api/authApi"

export function useAuth() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isSeller = useAppSelector(selectIsSeller)
  const isAdmin = useAppSelector(selectIsAdmin)
  const [triggerLogout] = useLogoutUserMutation()

  const logout = () => dispatch(logoutAction())

  const logoutAsync = async () => {
    try { await triggerLogout().unwrap() } catch { /* best effort */ }
    dispatch(logoutAction())
  }

  return { user, isAuthenticated, isSeller, isAdmin, logout, logoutAsync }
}
