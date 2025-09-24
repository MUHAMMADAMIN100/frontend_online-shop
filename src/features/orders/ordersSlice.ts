import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export interface OrderItem {
  id: number;
  orderId?: number;
  productId: number;
  quantity: number;
  price: number;
  product?: any;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  createdAt?: string;
}

interface OrdersState {
  items: Order[];
  status: 'idle'|'loading'|'succeeded'|'failed';
}

const initialState: OrdersState = { items: [], status: 'idle' };

export const createOrder = createAsyncThunk<Order>('orders/create', async () => {
  const res = await api.post('/orders');
  return res.data as Order;
});

export const fetchOrders = createAsyncThunk<Order[]>('orders/fetch', async () => {
  const res = await api.get('/orders');
  return res.data as Order[];
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default ordersSlice.reducer;
