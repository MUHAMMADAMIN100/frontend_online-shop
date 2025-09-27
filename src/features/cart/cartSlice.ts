import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../../app/store";
import jwt_decode from "jwt-decode";

const API_URL = "http://localhost:3001/cart";

// функция для извлечения userId из токена (если надо где-то ещё)
const getUserIdFromToken = (token: string | null): number | null => {
  if (!token) return null;
  try {
    const decoded: any = jwt_decode(token);
    return decoded.userId ?? null;
  } catch {
    return null;
  }
};

// ================== THUNKS ==================

// Получить корзину
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Unauthorized");

    console.log("=== fetchCart called ===", { token });

    const res = await axios.get(`${API_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // сервер возвращает cart с items
  }
);

// Добавить товар в корзину
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { productId, quantity }: { productId: number; quantity: number },
    { getState }
  ) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    console.log("=== addToCart called ===");
    console.log("token:", token);
    console.log("productId:", productId, "quantity:", quantity);

    if (!token) throw new Error("Unauthorized");

    const res = await axios.post(
      `${API_URL}/add`,
      { productId, quantity }, // ⚡ userId не нужен — берётся из токена
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("=== addToCart response ===", res.data);

    return res.data;
  }
);

// Удалить товар
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (cartItemId: number, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    if (!token) throw new Error("Unauthorized");

    console.log("=== removeFromCart called ===", { cartItemId });

    await axios.delete(`${API_URL}/remove/${cartItemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return cartItemId;
  }
);

// Очистить корзину
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;
    const userId = getUserIdFromToken(token);
    if (!token || !userId) throw new Error("Unauthorized");

    console.log("=== clearCart called ===", { userId });

    await axios.delete(`${API_URL}/clear/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return [];
  }
);

// ================== SLICE ==================
interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
  };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        console.log("=== fetchCart.fulfilled ===", action.payload);
        state.items = action.payload.items || [];
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const item = action.payload;
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          existing.quantity = item.quantity; // сервер вернул актуальное значение
        } else {
          state.items.push(item);
        }
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        console.log("=== removeFromCart.fulfilled ===", action.payload);
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(clearCart.fulfilled, (state) => {
        console.log("=== clearCart.fulfilled ===");
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
