import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
interface AuthState {
  token: string | null;
  userId?: number | null;
  role?: string | null;
}

const tokenFromStorage = localStorage.getItem('token');

const initialState: AuthState = {
  token: tokenFromStorage,
  userId: tokenFromStorage ? Number(localStorage.getItem('userId')) : null,
  role: localStorage.getItem('role') ?? null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; userId?: number; role?: string }>) {
      state.token = action.payload.token;
      state.userId = action.payload.userId ?? null;
      state.role = action.payload.role ?? null;
      localStorage.setItem('token', action.payload.token);
      if (action.payload.userId) localStorage.setItem('userId', String(action.payload.userId));
      if (action.payload.role) localStorage.setItem('role', action.payload.role);
    },
    logout(state) {
      state.token = null;
      state.userId = null;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
