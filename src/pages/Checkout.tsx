import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

const Checkout: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckout = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessage("✅ Заказ успешно оформлен!");
        console.log("Order created:", data);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "❌ Ошибка при оформлении заказа");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-b from-gray-100 to-gray-200 p-6 min-h-screen">
      <div className="bg-white shadow-2xl p-8 rounded-3xl w-full max-w-md animate-scaleUp">
        <h2 className="drop-shadow-lg mb-6 font-extrabold text-blue-900 text-3xl text-center">
          🛒 Оформление заказа
        </h2>

        {message && (
          <p className={`mb-6 text-center font-semibold ${message.includes("успешно") ? "text-green-600" : "text-red-500"}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 hover:from-blue-700 to-blue-800 hover:to-blue-900 shadow-lg hover:shadow-2xl py-3 rounded-2xl w-full font-bold text-white hover:scale-105 transition-transform transform"
        >
          {loading ? "Оформляем..." : "Оформить заказ"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;