import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import type { RootState } from "../../app/store"
import jwt_decode from "jwt-decode"

const API_URL = "https://backend-online-shop-vrxj.onrender.com/cart"

const getUserIdFromToken = (token: string | null): number | null => {
  if (!token) return null
  try {
    const decoded: any = jwt_decode(token)
    return decoded.userId ?? null
  } catch {
    return null
  }
}

const validateToken = (token: string | null): boolean => {
  if (!token) {
    console.log("[v0] No token found")
    return false
  }

  try {
    const decoded: any = jwt_decode(token)
    const currentTime = Date.now() / 1000

    if (decoded.exp && decoded.exp < currentTime) {
      console.log("[v0] Token expired")
      return false
    }

    console.log("[v0] Token valid, userId:", decoded.userId)
    return true
  } catch (error) {
    console.log("[v0] Token validation error:", error)
    return false
  }
}

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState
    const token = state.auth.token
    const userId = getUserIdFromToken(token)

    if (!validateToken(token) || !userId) {
      return rejectWithValue("Invalid or expired token")
    }

    const res = await axios.get(`${API_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    })

    return res.data
  } catch (error: any) {
    console.log("[v0] fetchCart error:", error.response?.status, error.message)
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }: { productId: number; quantity: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.token

      if (!validateToken(token)) {
        return rejectWithValue("Invalid or expired token")
      }

      const res = await axios.post(
        `${API_URL}/add`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        },
      )

      console.log("[v0] addToCart success:", res.data)
      return res.data
    } catch (error: any) {
      console.log("[v0] addToCart error:", error.response?.status, error.message)

      if (error.response?.status === 404) {
        return rejectWithValue("Cart endpoint not found. Please check if the backend server is running.")
      } else if (error.response?.status === 401) {
        return rejectWithValue("Unauthorized. Please log in again.")
      } else if (error.code === "ECONNREFUSED") {
        return rejectWithValue("Cannot connect to server. Please check if the backend is running.")
      }

      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)


export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (cartItemId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState
      const token = state.auth.token

      if (!validateToken(token)) {
        return rejectWithValue("Invalid or expired token")
      }

      await axios.delete(`${API_URL}/remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      })

      return cartItemId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

export const clearCart = createAsyncThunk("cart/clearCart", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState
    const token = state.auth.token
    const userId = getUserIdFromToken(token)

    if (!validateToken(token) || !userId) {
      return rejectWithValue("Invalid or expired token")
    }

    await axios.delete(`${API_URL}/clear/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    })

    return []
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

interface CartItem {
  id: number
  productId: number
  quantity: number
  product: {
    id: number
    name: string
    description: string
    price: number
    image?: string
  }
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items || []
        state.error = null
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false
        const item = action.payload
        const existing = state.items.find((i) => i.productId === item.productId)
        if (existing) {
          existing.quantity = item.quantity
        } else {
          state.items.push(item)
        }
        state.error = null
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((i) => i.id !== action.payload)
        state.error = null
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(clearCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false
        state.items = []
        state.error = null
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = cartSlice.actions
export default cartSlice.reducer
