import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string;
}

interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  createdAt: string;
  items: OrderItem[];
}

const OrdersHistory: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:3001/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error("Unauthorized — токен отсутствует или неверный!");
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error("Ошибка при получении заказов:", response.status);
      }
    } catch (error) {
      console.error("Ошибка при запросе заказов:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-gray-500 text-xl text-center">Загрузка заказов...</div>;
  }

  if (orders.length === 0) {
    return <div className="py-16 text-gray-500 text-xl text-center">История заказов пуста.</div>;
  }

  return (
    <div className="mx-auto p-6 max-w-6xl">
      <h2 className="mb-8 font-bold text-gray-800 text-3xl text-center">История заказов</h2>
      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="bg-gradient-to-r from-white to-gray-50 shadow-lg hover:shadow-2xl p-6 rounded-xl transition">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700 text-xl">Заказ #{order.id}</h3>
              <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-white shadow-sm hover:shadow-md p-3 rounded-lg transition">
                  <img
                    src={item.product.image || "https://via.placeholder.com/80"}
                    alt={item.product.name}
                    className="rounded-lg w-20 h-20 object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.product.name}</p>
                    <p className="text-gray-500">{item.quantity} × {item.price}₽</p>
                  </div>
                  <p className="font-semibold text-gray-700">{item.quantity * item.price}₽</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <p className="font-bold text-gray-800 text-lg">
                Итого: {order.items.reduce((sum, i) => sum + i.quantity * i.price, 0)}₽
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersHistory;
