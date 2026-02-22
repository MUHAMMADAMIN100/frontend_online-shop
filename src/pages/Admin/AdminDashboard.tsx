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
        const res = await axios.get("https://backend-online-shop-vrxj.onrender.com/auth/validate-admin", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 200) setLoading(false)
        else {
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

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Проверка прав администратора...
      </div>
    )

  return (
    <div className="bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="flex sm:flex-row flex-col justify-between items-center gap-4 mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
          <h1 className="drop-shadow-lg font-extrabold text-blue-900 text-2xl sm:text-left text-center">
            Панель администратора
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-600">Администратор</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 shadow hover:shadow-lg px-4 py-2 rounded-2xl w-full sm:w-auto font-semibold text-white hover:scale-105 transition transform"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-6 mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-full sm:max-w-7xl">
        {/* Navigation */}
        <nav>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 bg-white shadow-md p-2 rounded-2xl">
            <Link
              to="/admin/users"
              className="hover:bg-blue-100 px-4 py-2 rounded-xl w-full sm:w-auto text-gray-700 text-sm text-center hover:scale-105 transition transform"
            >
              Пользователи
            </Link>
            <Link
              to="/admin/products"
              className="hover:bg-blue-100 px-4 py-2 rounded-xl w-full sm:w-auto text-gray-700 text-sm text-center hover:scale-105 transition transform"
            >
              Товары
            </Link>
          </div>
        </nav>

        {/* Content Routes */}
        <div className="bg-white shadow-xl hover:shadow-2xl p-4 rounded-2xl w-full overflow-x-auto transition">
          <Routes>
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/products" element={<ProductsManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard