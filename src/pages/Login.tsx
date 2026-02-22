import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import Swal from "sweetalert2"
import { setCredentials } from "../features/auth/authSlice"
import type { AppDispatch } from "../app/store"

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("https://backend-online-shop-vrxj.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.ok) {
        dispatch(
          setCredentials({
            token: data.access_token,
            role: data.user.role,
          })
        )

        Swal.fire({
          icon: 'success',
          title: 'Вход выполнен!',
          text: 'Добро пожаловать!',
          timer: 1500,
          showConfirmButton: false,
          backdrop: true,
        })

        // Перенаправление по роли
        if (data.user.role === "ADMIN") {
          navigate("/admin")
        } else {
          navigate("/")
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ошибка при логине',
          text: data.message || 'Проверьте email и пароль',
        })
      }
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Ошибка подключения',
        text: 'Не удалось подключиться к серверу',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center bg-gradient-to-b from-gray-100 to-gray-200 p-6 min-h-screen">
      <form
        className="bg-white shadow-2xl p-8 rounded-3xl w-full max-w-md animate-scaleUp"
        onSubmit={handleSubmit}
      >
        <h2 className="drop-shadow-lg mb-8 font-extrabold text-blue-900 text-3xl text-center">
          🔑 Вход в аккаунт
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-full transition"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 hover:from-blue-700 to-blue-800 hover:to-blue-900 disabled:opacity-50 shadow-lg hover:shadow-2xl py-3 rounded-2xl w-full font-bold text-white hover:scale-105 transition-transform transform"
          disabled={loading}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  )
}

export default LoginPage