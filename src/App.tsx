

import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import ProductPage from "./pages/ProductPage"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Navbar from "./components/Navbar"
import AdminDashboard from "./pages/Admin/AdminDashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "./app/store"
import { fetchCart } from "./features/cart/cartSlice"
import createCart from "./features/cart/cartSlice"
import { syncFromStorage } from "./features/auth/authSlice"
import OrdersHistory from "./pages/OrdersHistory"

export default function App() {
  const dispatch = useDispatch<AppDispatch>()
  const token = useSelector((state: RootState) => state.auth.token)
  const cartError = useSelector((state: RootState) => state.cart.error)

  useEffect(() => {
    console.log("[v0] App mounting, syncing from storage")
    dispatch(syncFromStorage())
  }, [dispatch])

  useEffect(() => {
    if (token) {
      console.log("[v0] Token found, loading cart after delay")
      // Small delay to ensure backend is ready
      const timer = setTimeout(async () => {
        try {
          await dispatch(fetchCart()).unwrap()
          console.log("[v0] Cart loaded successfully")
        } catch (error: any) {
          console.log("[v0] Failed to load cart:", error)
          if (error.includes("не найдена") || error.includes("not found")) {
            console.log("[v0] Cart not found, attempting to create new cart")
            try {
              await dispatch(createCart()).unwrap()
              console.log("[v0] New cart created successfully")
            } catch (createError) {
              console.log("[v0] Failed to create cart:", createError)
            }
          }
        }
      }, 500)

      return () => clearTimeout(timer)
    } else {
      console.log("[v0] No token found, skipping cart load")
    }
  }, [token, dispatch])

  useEffect(() => {
    if (cartError) {
      console.log("[v0] Cart error occurred:", cartError)
      // You can show a toast notification here if you have one
    }
  }, [cartError])

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      {cartError && (
        <div className="bg-red-100 mx-4 mt-4 px-4 py-3 border border-red-400 rounded text-red-700">
          <strong>Cart Error:</strong> {cartError}
        </div>
      )}
      <main className="mx-auto p-4 container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orderHistory" element={<OrdersHistory/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
