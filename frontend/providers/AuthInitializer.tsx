"use client"

import { useEffect } from "react"
import { useGetMeQuery } from "@/store/api/authApi"
import { useAppSelector } from "@/hooks/useAppSelector"
import { useAppDispatch } from "@/hooks/useAppDispatch"
import { selectAccessToken, setCredentials } from "@/store/slices/authSlice"

export function AuthInitializer() {
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(selectAccessToken)

  const { data } = useGetMeQuery(undefined, { skip: !accessToken })

  useEffect(() => {
    if (data?.user && accessToken) {
      dispatch(setCredentials({ user: data.user, accessToken }))
    }
  }, [data, accessToken, dispatch])

  return null
}
