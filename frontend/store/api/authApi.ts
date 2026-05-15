import { baseApi } from "./baseApi"
import type { User } from "../slices/authSlice"

interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({ url: "/auth/login", method: "POST", body: credentials }),
    }),
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string; phone?: string }>({
      query: (data) => ({ url: "/auth/register", method: "POST", body: data }),
    }),
    logoutUser: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation, useLogoutUserMutation, useGetMeQuery } = authApi
