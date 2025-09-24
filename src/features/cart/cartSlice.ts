import { createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import type { Product } from '../products/productsSlice';

export interface CartItem {
  id: number;
  cartId?: number;
  productId: number;
  quantity: number;
  product?: Product;
}

interface CartState {
  items: CartItem[];
  status: 'idle'|'loading'|'succeeded'|'failed';
  error?: string | null;
}

const initialState: CartState = { items: [], status: 'idle', error: null };

export const fetchCart = createAsyncThunk<CartItem[], number>('cart/fetch', async (userId) => {
  const res = await api.get(`/cart/${userId}`);
  // backend returns cart object with items
  return (res.data.items ?? []) as CartItem[];
});

export const addToCart = createAsyncThunk<CartItem, { userId: number; productId: number; quantity: number }>(
  'cart/add',
  async ({ userId, productId, quantity }) => {
    const res = await api.post('/cart/add', { userId, productId, quantity });
    return res.data as CartItem;
  }
);

export const updateCartItem = createAsyncThunk<CartItem, { cartItemId: number; quantity: number }>(
  'cart/update',
  async ({ cartItemId, quantity }) => {
    const res = await api.put(`/cart/update/${cartItemId}`, { quantity });
    return res.data as CartItem;
  }
);

export const removeCartItem = createAsyncThunk<number, number>('cart/remove', async (cartItemId) => {
  const res = await api.delete(`/cart/remove/${cartItemId}`);
  return res.data.id as number;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: { clearLocalCart(state) { state.items = []; } },
  extraReducers(builder) {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => { state.items = action.payload; state.status = 'succeeded'; })
      .addCase(addToCart.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export const { clearLocalCart } = cartSlice.actions;
export default cartSlice.reducer;
