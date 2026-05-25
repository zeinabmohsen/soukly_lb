import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { updateToken } from "../slices/authSlice"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { accessToken: string | null } }).auth.accessToken
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

let refreshPromise: Promise<string | null> | null = null

const performRefresh = async (
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<string | null> => {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    const result = await rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions)
    if (result.data) {
      const { access_token } = result.data as { access_token: string }
      api.dispatch(updateToken(access_token))
      return access_token
    }
    return null
  })()
  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const newToken = await performRefresh(api, extraOptions)
    if (newToken) {
      result = await rawBaseQuery(args, api, extraOptions)
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
