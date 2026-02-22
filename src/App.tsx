import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./app/store";
import { fetchCart, createCart } from "./features/cart/cartSlice";
import { syncFromStorage } from "./features/auth/authSlice";
import OrdersHistory from "./pages/OrdersHistory";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const cartError = useSelector((state: RootState) => state.cart.error);

  useEffect(() => {
    console.log("App mounting, syncing from storage");
    dispatch(syncFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!token) {
      console.log("No token found, skipping cart load");
      return;
    }

    console.log("Token found, loading cart after delay");
    const timer = setTimeout(async () => {
      try {
        await dispatch(fetchCart()).unwrap();
        console.log("Cart loaded successfully");
      } catch (error: unknown) {
        console.log("Failed to load cart:", error);

        const errMsg = typeof error === "string" ? error : JSON.stringify(error);

        if (errMsg.includes("не найдена") || errMsg.includes("not found")) {
          console.log("Cart not found, attempting to create new cart");
          try {
            await dispatch(createCart()).unwrap();
            console.log("New cart created successfully");
          } catch (createError: unknown) {
            console.log("Failed to create cart:", createError);
          }
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [token, dispatch]);

  useEffect(() => {
    if (cartError) {
      console.log("Cart error occurred:", cartError);
    }
  }, [cartError]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="mx-auto p-4 container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orderHistory" element={<OrdersHistory />} />
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
  );
}