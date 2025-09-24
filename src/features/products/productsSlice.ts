import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  createdAt?: string;
}

interface ProductsState {
  items: Product[];
  status: 'idle'|'loading'|'succeeded'|'failed';
  error?: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

// payload аргумент — объект фильтров (все опционально)
export const fetchProducts = createAsyncThunk<Product[], { category?: string; minPrice?: number; maxPrice?: number; search?: string } | void>(
  'products/fetch',
  async (filters) => {
    // Соберём query string
    if (!filters) {
      const res = await api.get('/products');
      return res.data;
    }
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters.search) params.append('search', filters.search);
    const url = '/products' + (params.toString() ? `?${params.toString()}` : '');
    const res = await api.get(url);
    return res.data;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Error';
      });
  },
});

export default productsSlice.reducer;
