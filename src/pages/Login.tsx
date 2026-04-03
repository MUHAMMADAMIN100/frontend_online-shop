import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setCredentials } from "../features/auth/authSlice"
import type { AppDispatch } from "../app/store"
import { notify } from "../utils/swal"

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        dispatch(setCredentials({ token: data.access_token, role: data.user.role }))
        notify.welcome(data.user.role)
        if (data.user.role === "ADMIN") navigate("/admin")
        else navigate("/")
      } else {
        notify.error('Errore di accesso', data.message || 'Проверьте email и пароль')
      }
    } catch {
      notify.error('Errore di connessione', 'Не удалось подключиться к серверу')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F7F4EF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24
    }}>
      <div className="animate-scaleUp" style={{ width: '100%', maxWidth: 440 }}>

        {/* Лого */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <svg width="72" height="80" viewBox="0 0 124 136" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 62 7 A 55 55 0 1 0 112 88" stroke="#8B0000" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              <path d="M 112 88 C 124 98 122 118 108 116 C 94 114 86 100 92 86" stroke="#8B0000" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
              <text x="14" y="88" fontFamily="'Playfair Display', Georgia, serif" fontSize="72" fill="#8B0000" fontStyle="italic" fontWeight="400">D</text>
              <text x="60" y="88" fontFamily="'Playfair Display', Georgia, serif" fontSize="72" fill="#8B0000" fontWeight="400">R</text>
            </svg>
          </div>
          <h1 className="serif" style={{ fontSize: 28, color: '#8B0000', letterSpacing: 6, fontWeight: 500, marginBottom: 4 }}>
            DORRO
          </h1>
          <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#999', fontFamily: 'Montserrat' }}>
            Italian Atelier · Вход
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            <div style={{ width: 30, height: 1, backgroundColor: '#008000' }} />
            <div style={{ width: 5, height: 5, backgroundColor: '#FF0000', borderRadius: '50%' }} />
            <div style={{ width: 30, height: 1, backgroundColor: '#FF0000' }} />
          </div>
        </div>

        {/* Форма */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', padding: '40px 48px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', fontFamily: 'Montserrat', display: 'block', marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', fontFamily: 'Montserrat', display: 'block', marginBottom: 8 }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', textAlign: 'center', marginTop: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Вход..." : "Войти"}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#888', fontFamily: 'Montserrat' }}>
            Нет аккаунта?{' '}
            <Link to="/register" style={{ color: '#FF0000', textDecoration: 'none', fontWeight: 600, letterSpacing: 1 }}>
              Регистрация
            </Link>
          </p>
        </div>

        {/* Триколор снизу */}
        <div className="tricolor" style={{ marginTop: 0 }} />
      </div>
    </div>
  )
}

export default LoginPage
