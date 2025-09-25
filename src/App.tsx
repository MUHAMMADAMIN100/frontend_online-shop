import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/Admin/AdminDashboard';

export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="mx-auto p-4 container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
