import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
interface AuthState {
  token: string | null;
  role: string | null;
}

// Загружаем токен и роль при старте приложения
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; role?: string }>) {
      const { token, role } = action.payload;

      // Обновляем состояние Redux
      state.token = token;
      state.role = role ?? state.role ?? null;

      // Сохраняем в localStorage
      localStorage.setItem('token', token);
      if (role) localStorage.setItem('role', role);
    },
    logout(state) {
      state.token = null;
      state.role = null;

      // Удаляем из localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    },
    syncFromStorage(state) {
      // Если токен в localStorage изменился (например, вручную), синхронизируем Redux
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      state.token = token ?? null;
      state.role = role ?? null;
    },
  },
});

export const { setCredentials, logout, syncFromStorage } = authSlice.actions;
export default authSlice.reducer;
