import React, { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"

interface Order {
  id: number
  userId: number
  status: string
  total: number
  createdAt: string
  user: { email: string }
}

const OrdersManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("https://backend-online-shop-vrxj.onrender.com/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Ошибка при загрузке заказов:", error)
      setMessage("Ошибка при загрузке заказов")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(
        `https://backend-online-shop-vrxj.onrender.com/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
        setMessage(`Статус заказа #${orderId} обновлен`)
        setTimeout(() => setMessage(""), 2000)
      } else {
        setMessage("Ошибка при обновлении статуса")
        setTimeout(() => setMessage(""), 2000)
      }
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error)
      setMessage("Ошибка при обновлении статуса")
      setTimeout(() => setMessage(""), 2000)
    }
  }

  if (loading)
    return (
      <div className="py-16 text-gray-500 text-xl text-center">Загрузка заказов...</div>
    )

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 shadow-lg p-6 rounded-2xl min-h-screen">
      <h2 className="drop-shadow-lg mb-6 font-bold text-blue-900 text-2xl md:text-3xl text-center">
        Управление заказами
      </h2>

      {message && (
        <div className="bg-green-100 mb-4 p-3 rounded-lg font-medium text-green-800 text-center animate-fadeIn">
          {message}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl overflow-x-auto">
        <table className="divide-y divide-gray-200 min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {["ID", "Пользователь", "Статус", "Сумма", "Дата", "Действия"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-blue-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 text-gray-900 text-sm">{order.id}</td>
                <td className="px-6 py-4 text-gray-900 text-sm">{order.user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : order.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 text-sm">{order.total}₽</td>
                <td className="px-6 py-4 text-gray-900 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-6 py-4 text-sm">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 hover:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm transition"
                  >
                    <option value="PENDING">В ожидании</option>
                    <option value="PROCESSING">В обработке</option>
                    <option value="COMPLETED">Завершен</option>
                    <option value="CANCELLED">Отменен</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrdersManagement