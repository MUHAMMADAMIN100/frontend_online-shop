import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import productReducer from '../features/products/productsSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
  },
});

// Типы для typed hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
