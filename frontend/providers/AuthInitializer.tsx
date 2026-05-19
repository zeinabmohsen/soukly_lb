"use client"

import { useEffect } from "react"
import { useGetMeQuery } from "@/store/api/authApi"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { selectAccessToken, setCredentials, logout } from "@/store/slices/authSlice"

export function AuthInitializer() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)
  const { data, error, isLoading } = useGetMeQuery()

  useEffect(() => {
    if (isLoading) return
    if (data?.user && accessToken) {
      dispatch(setCredentials({ user: data.user, accessToken }))
    } else if (error) {
      dispatch(logout())
    }
  }, [data, error, accessToken, isLoading, dispatch])

  return null
}
