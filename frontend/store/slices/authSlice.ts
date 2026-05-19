import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  is_seller: boolean
  seller_status: "none" | "pending" | "approved" | "rejected"
  is_admin: boolean
  is_verified: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
}

function loadStoredUser(): AuthState {
  if (typeof window === "undefined") return { user: null, accessToken: null }
  try {
    const stored = localStorage.getItem("soukly_auth")
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.user) return { user: parsed.user, accessToken: null }
    }
  } catch {}
  return { user: null, accessToken: null }
}

const authSlice = createSlice({
  name: "auth",
  initialState: loadStoredUser as () => AuthState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      localStorage.setItem("soukly_auth", JSON.stringify({ user: action.payload.user }))
    },
    updateToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload
    },
    logout(state) {
      state.user = null
      state.accessToken = null
      localStorage.removeItem("soukly_auth")
    },
  },
})

export const { setCredentials, updateToken, logout } = authSlice.actions
export default authSlice.reducer

export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.user
export const selectIsSeller = (state: { auth: AuthState }) =>
  state.auth.user?.is_seller === true && state.auth.user?.seller_status === "approved"
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.is_admin === true
