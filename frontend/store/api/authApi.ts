import { baseApi } from "./baseApi"
import type { User } from "../slices/authSlice"

interface AuthResponse {
  user: User
  access_token: string
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
    // Boot-time session restore. The refresh cookie is httpOnly, so the only way
    // to know if we're still logged in is to ask: this returns a fresh user +
    // access token in ONE request (vs the old /auth/me → 401 → refresh → retry
    // three-request dance). baseApi treats /auth/refresh as the refresh call, so
    // it won't recursively pre-empt/retry this.
    refreshSession: builder.mutation<AuthResponse, void>({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<{ message: string }, { token: string; password: string }>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutUserMutation,
  useRefreshSessionMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi
