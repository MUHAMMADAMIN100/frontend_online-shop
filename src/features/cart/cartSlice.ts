// src/features/cart/cartSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:3001/cart";

// Берём токен из localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Получить корзину по userId
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId: number) => {
    const res = await axios.get(`${API_URL}/${userId}`, getAuthHeader());
    return res.data;
  }
);

// Добавить товар
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }: { productId: number; quantity: number }) => {
    const res = await axios.post(`${API_URL}/add`, { productId, quantity }, getAuthHeader());
    return res.data;
  }
);

// Обновить товар
export const updateItem = createAsyncThunk(
  "cart/updateItem",
  async ({ cartItemId, quantity }: { cartItemId: number; quantity: number }) => {
    const res = await axios.put(`${API_URL}/update/${cartItemId}`, { quantity }, getAuthHeader());
    return res.data;
  }
);

// Удалить товар
export const removeItem = createAsyncThunk(
  "cart/removeItem",
  async (cartItemId: number) => {
    await axios.delete(`${API_URL}/remove/${cartItemId}`, getAuthHeader());
    return cartItemId;
  }
);

// Очистить корзину
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId: number) => {
    await axios.delete(`${API_URL}/clear/${userId}`, getAuthHeader());
    return [];
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [] as any[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
