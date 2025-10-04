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
      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessage("Заказ успешно оформлен!");
        console.log("Order created:", data);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Ошибка при оформлении заказа");
      }
    } catch (error) {
      console.error(error);
      setMessage("Ошибка при оформлении заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow mx-auto mt-6 p-6 rounded-lg max-w-xl">
      <h2 className="mb-4 font-semibold text-2xl">Оформление заказа</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white"
      >
        {loading ? "Оформляем..." : "Оформить заказ"}
      </button>
    </div>
  );
};

export default Checkout;
