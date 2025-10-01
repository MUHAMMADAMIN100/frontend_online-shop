

import type React from "react"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"

interface User {
  id: number
  email: string
  role: string
  createdAt: string
}

const UsersManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3001/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const promoteToAdmin = async (userId: number) => {
    if (
      !confirm(
        "Вы уверены, что хотите передать права администратора этому пользователю? Вы потеряете свои права администратора.",
      )
    ) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/auth/promote-to-admin/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert("Права администратора успешно переданы. Вы будете перенаправлены на страницу входа.")
        window.location.href = "/login"
      } else {
        const data = await response.json()
        alert(data.message || "Ошибка при передаче прав")
      }
    } catch (error) {
      console.error("Error promoting user:", error)
      alert("Ошибка при передаче прав")
    }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId))
        alert("Пользователь удален")
      } else {
        alert("Ошибка при удалении пользователя")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Ошибка при удалении пользователя")
    }
  }

  if (loading) {
    return <div className="py-8 text-center">Загрузка пользователей...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-gray-200 border-b">
        <h2 className="font-semibold text-gray-900 text-xl">Управление пользователями</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="divide-y divide-gray-200 min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Роль</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Дата регистрации
              </th>
              <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="space-x-2 px-6 py-4 font-medium text-sm whitespace-nowrap">
                  {user.role !== "ADMIN" && (
                    <button onClick={() => promoteToAdmin(user.id)} className="text-blue-600 hover:text-blue-900">
                      Сделать админом
                    </button>
                  )}
                  {user.role !== "ADMIN" && (
                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900">
                      Удалить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersManagement
