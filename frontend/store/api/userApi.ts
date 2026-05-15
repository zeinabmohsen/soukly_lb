import { baseApi } from "./baseApi"
import type { User } from "../slices/authSlice"

export interface PaginatedUsers {
  data: User[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface SellerDraft {
  businessName?: string
  businessCategory?: string
  city?: string
  businessDescription?: string
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsers, { search?: string; limit?: number; offset?: number } | void>({
      query: (params) => ({ url: "/users", params: params ?? {} }),
      providesTags: ["User"],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: "User", id }],
    }),
    updateUser: builder.mutation<
      User,
      { id: string; name?: string; email?: string; phone?: string; avatar_url?: string }
    >({
      query: ({ id, ...data }) => ({ url: `/users/${id}`, method: "PATCH", body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "User", id }, "User"],
    }),
    updateSellerStatus: builder.mutation<User, { id: string; status: "approved" | "rejected" | "pending" }>({
      query: ({ id, status }) => ({ url: `/users/${id}/seller-status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["User"],
    }),
    // Admin: reset a user's password
    resetUserPassword: builder.mutation<{ message: string }, { id: string; password: string }>({
      query: ({ id, password }) => ({ url: `/users/${id}/password`, method: "PATCH", body: { password } }),
    }),

    // ── Seller application draft (DB-backed) ──────────────────────────────
    getMySellerDraft: builder.query<{ draft: SellerDraft | null }, void>({
      query: () => "/users/me/seller-draft",
      providesTags: [{ type: "User", id: "seller-draft" }],
    }),
    updateMySellerDraft: builder.mutation<{ draft: SellerDraft }, SellerDraft>({
      query: (draft) => ({ url: "/users/me/seller-draft", method: "PUT", body: { draft } }),
      invalidatesTags: [{ type: "User", id: "seller-draft" }],
    }),
    deleteMySellerDraft: builder.mutation<void, void>({
      query: () => ({ url: "/users/me/seller-draft", method: "DELETE" }),
      invalidatesTags: [{ type: "User", id: "seller-draft" }],
    }),
  }),
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateSellerStatusMutation,
  useResetUserPasswordMutation,
  useGetMySellerDraftQuery,
  useUpdateMySellerDraftMutation,
  useDeleteMySellerDraftMutation,
} = userApi
