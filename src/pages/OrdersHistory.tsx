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
      const response = await fetch("https://backend-online-shop-vrxj.onrender.com/orders", {
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
    return (
      <div className="py-16 text-gray-500 text-xl text-center">
        Загрузка заказов...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-gray-500 text-xl text-center">
        История заказов пуста.
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-6xl">
      <h2 className="drop-shadow-lg mb-10 font-extrabold text-blue-900 text-3xl text-center">
        📜 История заказов
      </h2>
      <div className="space-y-8">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-gradient-to-r from-white to-gray-50 shadow-xl hover:shadow-2xl p-6 rounded-3xl hover:scale-[1.01] transition-transform transform"
          >
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center mb-6">
              <h3 className="font-bold text-blue-800 text-xl sm:text-2xl">
                Заказ #{order.id}
              </h3>
              <p className="mt-2 sm:mt-0 text-gray-500 text-sm sm:text-base">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex sm:flex-row flex-col items-center sm:items-start gap-4 bg-white shadow-md hover:shadow-xl p-4 rounded-2xl hover:scale-[1.01] transition-transform transform"
                >
                  <img
                    src={item.product.image || "https://via.placeholder.com/100"}
                    alt={item.product.name}
                    className="rounded-2xl w-24 sm:w-20 h-24 sm:h-20 object-cover"
                  />
                  <div className="flex flex-col flex-1 justify-center">
                    <p className="font-semibold text-blue-900 sm:text-base text-lg truncate">
                      {item.product.name}
                    </p>
                    <p className="text-gray-500 sm:text-xs text-sm">
                      {item.quantity} × {item.price}₽
                    </p>
                  </div>
                  <p className="font-bold text-green-600 sm:text-base text-lg">
                    {item.quantity * item.price}₽
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <p className="font-extrabold text-blue-900 text-xl sm:text-2xl">
                Итого:{" "}
                {order.items.reduce((sum, i) => sum + i.quantity * i.price, 0)}₽
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersHistory;