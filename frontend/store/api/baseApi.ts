import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { updateToken, logout } from "../slices/authSlice"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { accessToken: string | null } }).auth.accessToken
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions)

    if (refreshResult.data) {
      const { access_token } = refreshResult.data as { access_token: string }
      api.dispatch(updateToken(access_token))
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Store", "Product", "StoreCategory", "Order", "Wishlist", "Review", "Address"],
  endpoints: () => ({}),
})
