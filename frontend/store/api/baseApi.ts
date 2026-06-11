import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"
import { updateToken } from "../slices/authSlice"

// When the access token is within this many ms of expiring, refresh it BEFORE
// firing the next request. Eliminates the "first request after 15m fails with
// 401, retries, succeeds" UX blip — instead we refresh quietly in the
// background. 60s gives plenty of head room for a slow refresh round-trip.
const REFRESH_LEAD_MS = 60 * 1000

const rawBaseQuery = fetchBaseQuery({
  // Same-origin by default: the browser hits the app's own domain and Next.js
  // rewrites() (see next.config.mjs) proxies /api/* to the real backend. This
  // keeps the refresh-token cookie first-party so it survives reloads in Safari
  // and other browsers that block third-party cookies.
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: { accessToken: string | null } }).auth.accessToken
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

let refreshPromise: Promise<string | null> | null = null

// Tracks a refresh initiated OUTSIDE performRefresh — specifically the
// boot-time /auth/refresh that AuthInitializer fires as an RTK mutation. That
// call goes straight through rawBaseQuery (it IS the refresh endpoint), so it
// can't share `refreshPromise`. Without coordination, a protected query that
// mounts at boot (e.g. an admin/seller page querying on the optimistic role
// from localStorage) would 401 and fire a SECOND, racing /auth/refresh in the
// same tab — rotating the token twice and risking a reuse-detection logout.
// While this is set, the reactive/pre-emptive paths await it instead.
let externalRefresh: Promise<void> | null = null

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

/** True when the access token is missing, expired, or about to expire. */
function tokenNeedsRefresh(state: unknown): boolean {
  const auth = (state as { auth: { accessToken: string | null; accessTokenExpiresAt: number | null } }).auth
  if (!auth.accessToken || !auth.accessTokenExpiresAt) return false
  return auth.accessTokenExpiresAt - Date.now() < REFRESH_LEAD_MS
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  // The refresh endpoint itself must never trigger a pre-emptive refresh —
  // that would deadlock (refresh calls refresh calls refresh…).
  const isRefreshCall =
    typeof args === "object" && args !== null && "url" in args && (args as FetchArgs).url === "/auth/refresh"

  // This IS the boot/explicit refresh call. Publish it as `externalRefresh` so
  // any concurrent request in this tab waits for it rather than firing its own,
  // and dispatch the new token immediately on success so the token is already
  // in state the moment the promise resolves.
  if (isRefreshCall) {
    let release!: () => void
    externalRefresh = new Promise<void>((r) => { release = r })
    try {
      const result = await rawBaseQuery(args, api, extraOptions)
      const token = (result.data as { access_token?: string } | undefined)?.access_token
      if (token) api.dispatch(updateToken(token))
      return result
    } finally {
      release()
      externalRefresh = null
    }
  }

  // If a boot/explicit refresh is already in flight, wait for it — it may
  // mint the token this request needs, avoiding a redundant second refresh.
  if (externalRefresh) await externalRefresh

  // Pre-emptive refresh: if our access token is close to expiring, refresh
  // BEFORE making the request so the request goes out with a fresh token.
  // performRefresh dedupes parallel callers via refreshPromise.
  if (tokenNeedsRefresh(api.getState())) {
    await performRefresh(api, extraOptions)
  }

  let result = await rawBaseQuery(args, api, extraOptions)

  // Reactive refresh: server still said 401 (maybe our exp was wrong, clock
  // skew, token got revoked, etc). Refresh and retry once.
  if (result.error?.status === 401) {
    // A boot refresh may have started since we last checked — prefer it.
    if (externalRefresh) {
      await externalRefresh
      result = await rawBaseQuery(args, api, extraOptions)
      if (result.error?.status !== 401) return result
    }
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
  tagTypes: ["User", "Store", "Product", "StoreCategory", "Order", "Wishlist", "Review", "Address", "Billing"],
  endpoints: () => ({}),
})
