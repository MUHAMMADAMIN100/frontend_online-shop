import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { notify } from "../utils/swal"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        await notify.registered()
        navigate("/login")
      } else {
        notify.error('Errore di registrazione', data.message || "Ошибка при регистрации")
      }
    } catch {
      notify.error('Errore di connessione', "Не удалось соединиться с сервером")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F7F4EF',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div className="animate-scaleUp" style={{ width: '100%', maxWidth: 440 }}>

        {/* Лого */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 64, height: 64,
            border: '1.5px solid #8B0000', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontFamily: "'Playfair Display', serif",
            color: '#8B0000', fontSize: 20, fontWeight: 600
          }}>OS</div>
          <h1 className="serif" style={{ fontSize: 28, color: '#8B0000', letterSpacing: 6, fontWeight: 500, marginBottom: 4 }}>
            OLIMPIA
          </h1>
          <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#999', fontFamily: 'Montserrat' }}>
            Sport Atelier · Регистрация
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            <div style={{ width: 30, height: 1, backgroundColor: '#008000' }} />
            <div style={{ width: 5, height: 5, backgroundColor: '#FF0000', borderRadius: '50%' }} />
            <div style={{ width: 30, height: 1, backgroundColor: '#FF0000' }} />
          </div>
        </div>

        {/* Форма */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', padding: '40px 48px' }}>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', fontFamily: 'Montserrat', display: 'block', marginBottom: 8 }}>
                Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} placeholder="your@email.com" />
            </div>
            <div>
              <label style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', fontFamily: 'Montserrat', display: 'block', marginBottom: 8 }}>
                Пароль
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} placeholder="••••••••" />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', textAlign: 'center', marginTop: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#888', fontFamily: 'Montserrat' }}>
            Уже есть аккаунт?{' '}
            <Link to="/login" style={{ color: '#FF0000', textDecoration: 'none', fontWeight: 600, letterSpacing: 1 }}>
              Войти
            </Link>
          </p>
        </div>
        <div className="tricolor" />
      </div>
    </div>
  )
}
