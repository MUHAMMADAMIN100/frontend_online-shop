import type React from "react"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"

interface Order {
  id: number
  userId: number
  status: string
  total: number
  createdAt: string
  user: {
    email: string
  }
}

const OrdersManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:3001/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
        alert("Статус заказа обновлен")
      } else {
        alert("Ошибка при обновлении статуса")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Ошибка при обновлении статуса")
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Загрузка заказов...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-gray-200 border-b">
        <h2 className="font-semibold text-gray-900 text-xl">Управление заказами</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-200 min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Пользователь
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Сумма</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Дата</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">{order.user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">{order.total}₽</td>
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
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
