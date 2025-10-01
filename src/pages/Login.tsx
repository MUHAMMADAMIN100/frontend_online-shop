"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
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
      const res = await fetch("http://localhost:3001/auth/login", {
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

        // Перенаправляем по роли
        if (data.user.role === "ADMIN") {
          navigate("/admin")
        } else {
          navigate("/")
        }
      } else {
        alert(data.message || "Ошибка при логине")
      }
    } catch (error) {
      console.error(error)
      alert("Ошибка при подключении к серверу")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center bg-gray-50 h-screen">
      <form className="bg-white shadow-lg p-8 rounded-lg w-96" onSubmit={handleSubmit}>
        <h2 className="mb-6 font-bold text-gray-800 text-3xl text-center">Вход</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 p-3 rounded-lg w-full font-semibold text-white transition-colors cursor-pointer"
          disabled={loading}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
