import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom"
import { logout } from "../../features/auth/authSlice"
import type { RootState, AppDispatch } from "../../app/store"
import axios from "axios"
import UsersManagement from "./UsersManagement"
import ProductsManagement from "./ProductsManagement"
import Analytics from "./Analytics"
import LoadingLogo from "../../components/LoadingLogo"

const NavItem = ({ to, label, it, active }: { to: string; label: string; it: string; active: boolean }) => (
  <Link to={to} style={{
    textDecoration: "none",
    backgroundColor: active ? "#8B0000" : "#FFFFFF",
    border: active ? "1px solid #8B0000" : "1px solid #D9CFC0",
    padding: "16px 32px",
    fontFamily: "Montserrat", fontSize: 10, letterSpacing: 3,
    textTransform: "uppercase",
    color: active ? "#FFFFFF" : "#1A1A1A",
    transition: "all 0.2s",
    display: "flex", flexDirection: "column", gap: 4, alignItems: "center"
  }}
    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = "#8B0000"; (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; (e.currentTarget as HTMLElement).style.borderColor = "#8B0000"; } }}
    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFFFF"; (e.currentTarget as HTMLElement).style.color = "#1A1A1A"; (e.currentTarget as HTMLElement).style.borderColor = "#D9CFC0"; } }}
  >
    <span style={{ fontSize: 9, color: active ? "rgba(255,255,255,0.7)" : "#888", letterSpacing: 3 }}>{it}</span>
    {label}
  </Link>
)

const AdminDashboard: React.FC = () => {
  const { token, role } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const validateAdmin = async () => {
      if (!token || role !== "ADMIN") { dispatch(logout()); navigate("/login"); return; }
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/validate-admin`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.status === 200) setLoading(false)
        else { dispatch(logout()); navigate("/login"); }
      } catch { dispatch(logout()); navigate("/login"); }
    }
    validateAdmin()
  }, [token, role, navigate, dispatch])

  const handleLogout = () => { dispatch(logout()); navigate("/login"); }

  if (loading) return <LoadingLogo height="100vh" />

  const navItems = [
    { to: "/admin/users",     label: "Пользователи", it: "Utenti" },
    { to: "/admin/products",  label: "Товары",       it: "Prodotti" },
    { to: "/admin/analytics", label: "Аналитика",    it: "Analisi" },
  ]

  return (
    <div style={{ backgroundColor: "#F7F4EF", minHeight: "100vh" }}>
      {/* Admin Header */}
      <div style={{ backgroundColor: "#8B0000", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 40, height: 40, border: "1.5px solid #FFFFFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", color: "#FFFFFF", fontSize: 14, fontWeight: 600 }}>DR</div>
          <div>
            <h1 className="serif" style={{ color: "#FFFFFF", fontSize: 20, letterSpacing: 4, fontWeight: 500, margin: 0 }}>DORRO</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", fontFamily: "Montserrat", margin: 0 }}>Pannello Amministratore</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ border: "1px solid rgba(255,255,255,0.5)", color: "#FFFFFF", padding: "8px 24px", fontFamily: "Montserrat", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", background: "transparent" }}>
          Выйти
        </button>
      </div>

      <div className="tricolor" />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px" }}>
        {/* Навигация */}
        <nav style={{ display: "flex", gap: 2, marginBottom: 32, flexWrap: "wrap" }}>
          {navItems.map(item => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              it={item.it}
              active={location.pathname.startsWith(item.to)}
            />
          ))}
        </nav>

        {/* Контент */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", padding: "32px" }}>
          <Routes>
            <Route path="/users"     element={<UsersManagement />} />
            <Route path="/products"  element={<ProductsManagement />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
