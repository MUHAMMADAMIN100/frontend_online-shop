import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
interface AuthState {
  token: string | null
  role: string | null
}

const initialState: AuthState = {
  token: null, // по умолчанию null
  role: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; role?: string }>) {
      const { token, role } = action.payload
      state.token = token
      state.role = role ?? null
      localStorage.setItem("token", token)
      if (role) localStorage.setItem("role", role)
    },
    logout(state) {
      state.token = null
      state.role = null
      localStorage.removeItem("token")
      localStorage.removeItem("role")
    },
    syncFromStorage(state) {
      const token = localStorage.getItem("token")
      const role = localStorage.getItem("role")
      state.token = token ?? null
      state.role = role ?? null
    },
  },
})

export const { setCredentials, logout, syncFromStorage } = authSlice.actions
export default authSlice.reducer
