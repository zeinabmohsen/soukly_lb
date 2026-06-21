import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  // Single role string mirroring beachbeds (admin > seller > user). Derived
  // server-side from the boolean flags below, which are kept for finer checks.
  role: "user" | "seller" | "admin"
  is_seller: boolean
  seller_status: "none" | "pending" | "approved" | "rejected" | "suspended"
  is_admin: boolean
  is_verified: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  // ms-since-epoch when the access token expires; null when we don't have one
  accessTokenExpiresAt: number | null
  // True while we're verifying the stored user via /auth/me. UI should treat
  // this as "I don't know yet" — don't show logged-in nav, don't show login
  // page. Set to false once AuthInitializer finishes its check.
  isHydrating: boolean
}

/** Decode a JWT payload (no signature verification — client only reads `exp`). */
function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null
    // JWT uses base64url; replace and pad for atob
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = atob(padded + "==".slice(0, (4 - (padded.length % 4)) % 4))
    const data = JSON.parse(json) as { exp?: number }
    return typeof data.exp === "number" ? data.exp * 1000 : null
  } catch {
    return null
  }
}

function loadStoredUser(): AuthState {
  // SSR: nothing in localStorage, and no point hydrating
  if (typeof window === "undefined") {
    return { user: null, accessToken: null, accessTokenExpiresAt: null, isHydrating: false }
  }
  try {
    const stored = localStorage.getItem("soukly_auth")
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.user) {
        // Beachbeds-style: the access token is now long-lived and persisted, so
        // if we have an unexpired one we're logged in immediately — no need to
        // block on the boot refresh. (AuthInitializer still fires /auth/refresh
        // in the background as a safety net to renew/rotate the session.)
        const token: string | null = typeof parsed.accessToken === "string" ? parsed.accessToken : null
        const exp = token ? decodeJwtExp(token) : null
        const tokenUsable = !!token && (exp === null || exp > Date.now())
        if (tokenUsable) {
          return { user: parsed.user, accessToken: token, accessTokenExpiresAt: exp, isHydrating: false }
        }
        // User but no usable token (legacy storage, or token expired): fall back
        // to the old "hydrate via /auth/refresh before trusting" path.
        return { user: parsed.user, accessToken: null, accessTokenExpiresAt: null, isHydrating: true }
      }
    }
  } catch {}
  return { user: null, accessToken: null, accessTokenExpiresAt: null, isHydrating: false }
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadStoredUser as () => AuthState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.accessTokenExpiresAt = decodeJwtExp(action.payload.accessToken)
      state.isHydrating = false
      // Persist the token (not just the user) so the session survives reloads
      // without needing a refresh round-trip.
      localStorage.setItem(
        "soukly_auth",
        JSON.stringify({ user: action.payload.user, accessToken: action.payload.accessToken }),
      )
    },
    updateToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload
      state.accessTokenExpiresAt = decodeJwtExp(action.payload)
      // Keep the persisted copy in sync when the token rotates.
      if (state.user) {
        localStorage.setItem(
          "soukly_auth",
          JSON.stringify({ user: state.user, accessToken: action.payload }),
        )
      }
    },
    /** AuthInitializer calls this when /auth/me fails — clear stale localStorage. */
    finishHydration(state, action: PayloadAction<{ ok: boolean }>) {
      state.isHydrating = false
      if (!action.payload.ok) {
        state.user = null
        state.accessToken = null
        state.accessTokenExpiresAt = null
        localStorage.removeItem("soukly_auth")
      }
    },
    logout(state) {
      state.user = null
      state.accessToken = null
      state.accessTokenExpiresAt = null
      state.isHydrating = false
      localStorage.removeItem("soukly_auth")
    },
  },
})

export const { setCredentials, updateToken, finishHydration, logout } = authSlice.actions
export default authSlice.reducer

export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken
export const selectAccessTokenExpiresAt = (state: { auth: AuthState }) => state.auth.accessTokenExpiresAt
export const selectIsHydrating = (state: { auth: AuthState }) => state.auth.isHydrating

// Lenient on purpose: returns true if there's a cached user, even while we're
// still verifying via /auth/me. This avoids spurious redirects to /login on
// every page load. Components that need certainty before navigating should
// also read selectIsHydrating and wait for it to settle.
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.user
export const selectRole = (state: { auth: AuthState }) => state.auth.user?.role ?? null
export const selectIsSeller = (state: { auth: AuthState }) =>
  state.auth.user?.is_seller === true && state.auth.user?.seller_status === "approved"
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.is_admin === true
