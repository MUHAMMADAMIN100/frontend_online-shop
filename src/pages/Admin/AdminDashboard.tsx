import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Routes, Route, Link, useNavigate } from "react-router-dom"
import { logout } from "../../features/auth/authSlice"
import type { RootState, AppDispatch } from "../../app/store"
import axios from "axios"

import UsersManagement from "./UsersManagement"
import ProductsManagement from "./ProductsManagement"

const AdminDashboard: React.FC = () => {
  const { token, role } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const validateAdmin = async () => {
      if (!token || role !== "ADMIN") {
        dispatch(logout())
        navigate("/login")
        return
      }

      try {
        const res = await axios.get("http://localhost:3001/auth/validate-admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 200) {
          setLoading(false)
        } else {
          dispatch(logout())
          navigate("/login")
        }
      } catch (error) {
        console.error("Ошибка валидации админа:", error)
        dispatch(logout())
        navigate("/login")
      }
    }

    validateAdmin()
  }, [token, role, navigate, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Проверка прав администратора...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center py-4">
            <h1 className="font-bold text-gray-900 text-2xl">Панель администратора</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">Администратор</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white shadow-sm p-1 rounded-lg">
            {/* <Link to="/admin" className="hover:bg-gray-100 px-4 py-2 rounded-md text-gray-700 text-sm">Статистика</Link> */}
            <Link to="/admin/users" className="hover:bg-gray-100 px-4 py-2 rounded-md text-gray-700 text-sm">Пользователи</Link>
            <Link to="/admin/products" className="hover:bg-gray-100 px-4 py-2 rounded-md text-gray-700 text-sm">Товары</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/products" element={<ProductsManagement />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard
