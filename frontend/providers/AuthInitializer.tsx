"use client"

import { useEffect } from "react"
import { useGetMeQuery } from "@/store/api/authApi"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { useAppSelector } from "@/hooks/useAppSelector"
import { selectAccessToken, setCredentials } from "@/store/slices/authSlice"

export function AuthInitializer() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)
  const { data, isLoading } = useGetMeQuery()

  useEffect(() => {
    if (isLoading) return
    if (data?.user && accessToken) {
      dispatch(setCredentials({ user: data.user, accessToken }))
    }
  }, [data, accessToken, isLoading, dispatch])

  return null
}
