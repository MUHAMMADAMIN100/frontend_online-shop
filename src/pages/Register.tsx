import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("https://backend-online-shop-vrxj.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Регистрация успешна!",
          text: "Теперь вы можете войти в систему.",
          timer: 1800,
          showConfirmButton: false,
        })
        navigate("/login")
      } else {
        Swal.fire({
          icon: "error",
          title: "Ошибка регистрации",
          text: data.message || "Произошла ошибка при регистрации",
        })
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Ошибка соединения",
        text: "Не удалось соединиться с сервером",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center bg-gradient-to-b from-gray-100 to-gray-200 p-4 min-h-screen">
      <form
        className="bg-white shadow-xl hover:shadow-2xl p-6 md:p-8 rounded-3xl w-full max-w-sm hover:scale-[1.01] transition-shadow transform"
        onSubmit={handleRegister}
      >
        <h2 className="drop-shadow-lg mb-6 font-extrabold text-blue-900 text-3xl text-center">
          Регистрация
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition"
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition"
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 hover:from-blue-700 to-blue-800 hover:to-blue-900 py-3 rounded-2xl w-full font-bold text-white hover:scale-105 transition-transform transform"
          disabled={loading}
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>

        <p className="mt-4 text-gray-600 text-sm md:text-base text-center">
          Уже есть аккаунт?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-500 hover:text-blue-600 underline transition cursor-pointer"
          >
            Войти
          </button>
        </p>
      </form>
    </div>
  )
}