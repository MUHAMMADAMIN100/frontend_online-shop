import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState, useRef } from "react";
import type { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";
import { parseJwt } from "../utils/jwt";

export default function Navbar() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { token, role } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isHome = location.pathname === "/";
  const isAdmin = location.pathname.startsWith("/admin");
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const user = parseJwt(token);

  // Закрывать drawer при смене маршрута
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Блокировать скролл страницы когда drawer открыт
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowProfile(false);
    setMobileOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header className="animate-navSlideDown navbar-sticky" style={{ position: "sticky", top: 0, zIndex: 100 }}>

        {/* Итальянская полоска */}
        <div style={{
          height: 10,
          background: "linear-gradient(to right, #008000 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #FF0000 66.66%)"
        }} />

        {/* Main nav */}
        <nav
          className={scrolled ? "navbar-scrolled" : ""}
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid #D9CFC0",
            padding: scrolled ? "8px 32px" : "14px 32px",
            transition: "padding 0.35s ease",
            WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
            backdropFilter: scrolled ? "blur(8px)" : "none",
          }}
        >
          <div className="navbar-inner" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 20 }}>

            {/* ── Logo ── */}
            <Link to="/" style={{
              textDecoration: "none", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 0, flexShrink: 0
            }}>
              <img src="/image.png" alt="DORRO" style={{
                width: scrolled ? 36 : 50,
                height: scrolled ? 36 : 50,
                objectFit: "contain",
                transition: "all 0.35s"
              }} />
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: scrolled ? 16 : 22,
                letterSpacing: 7, color: "#8B0000", fontWeight: 600,
                lineHeight: 1.1, transition: "font-size 0.35s"
              }}>DORRO</span>
              <div style={{ width: "100%", height: 1, backgroundColor: "#8B0000", margin: "2px 0" }} />
              <span style={{ fontSize: 6, letterSpacing: 3, color: "#8B0000", fontFamily: "Montserrat", textTransform: "uppercase" }}>
                Итальянский Ателье · 1991
              </span>
            </Link>

            {/* ── Filters (только десктоп, только на главной) ── */}
            {isHome && (
              <div className="nav-desktop-filters" style={{ flex: 1, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="nav-filter"
                  placeholder="Поиск..."
                  value={searchParams.get("search") || ""}
                  onChange={e => updateFilter("search", e.target.value)}
                  style={{ flex: 2, minWidth: 100 }}
                />
                <select
                  className="nav-filter"
                  value={searchParams.get("category") || ""}
                  onChange={e => updateFilter("category", e.target.value)}
                  style={{ flex: 1, minWidth: 130 }}
                >
                  <option value="">Все категории</option>
                  <option value="Кроссовки">Кроссовки</option>
                  <option value="Футболки">Футболки</option>
                  <option value="Шорты">Шорты</option>
                </select>
                <input
                  className="nav-filter"
                  type="number"
                  placeholder="от $"
                  value={searchParams.get("minPrice") || ""}
                  onChange={e => updateFilter("minPrice", e.target.value)}
                  style={{ width: 75 }}
                />
                <input
                  className="nav-filter"
                  type="number"
                  placeholder="до $"
                  value={searchParams.get("maxPrice") || ""}
                  onChange={e => updateFilter("maxPrice", e.target.value)}
                  style={{ width: 75 }}
                />
              </div>
            )}
            {!isHome && <div style={{ flex: 1 }} />}

            {/* ── Desktop right icons (скрыты на планшет/мобайл и на /admin) ── */}
            {!isAdmin && (
              <div className="nav-desktop-right" style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>

                {/* Корзина */}
                <Link to="/cart" style={{
                  position: "relative", textDecoration: "none",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  transition: "transform 0.2s"
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
                >
                  <svg width="22" height="22" fill="none" stroke="#008000" strokeWidth="1.6" viewBox="0 0 24 24">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  <span style={{ fontSize: 7, letterSpacing: 2, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600 }}>Корзина</span>
                  {totalCount > 0 && (
                    <span className="animate-scaleUp" style={{
                      position: "absolute", top: -6, right: -9,
                      backgroundColor: "#FF0000", color: "#fff",
                      borderRadius: "50%", width: 17, height: 17,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700
                    }}>{totalCount}</span>
                  )}
                </Link>

                <div style={{ width: 1, height: 36, backgroundColor: "#D9CFC0" }} />

                {/* Профиль */}
                {token ? (
                  <div ref={profileRef} style={{ position: "relative" }}>
                    <button onClick={() => setShowProfile(v => !v)} title="Профиль" style={{
                      width: 42, height: 42, borderRadius: "50%",
                      backgroundColor: "#8B0000", border: "2px solid transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      boxShadow: showProfile ? "0 4px 20px rgba(139,0,0,0.35)" : "0 2px 8px rgba(139,0,0,0.15)"
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
                    >
                      <svg width="19" height="19" fill="none" stroke="#FFFFFF" strokeWidth="1.8" viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                      </svg>
                    </button>
                    <span style={{ fontSize: 7, letterSpacing: 2, color: "#8B0000", fontFamily: "Montserrat", textTransform: "uppercase", display: "block", textAlign: "center", marginTop: 3 }}>Профиль</span>

                    {showProfile && (
                      <div className="animate-scaleUp" style={{
                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                        backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0",
                        width: 230, zIndex: 200, boxShadow: "0 16px 48px rgba(0,0,0,0.14)"
                      }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0ECE4", backgroundColor: "#FAFAF8" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#8B0000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24">
                                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                              </svg>
                            </div>
                            <div style={{ overflow: "hidden" }}>
                              <p style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", color: "#888", fontFamily: "Montserrat", marginBottom: 2 }}>
                                {role === "ADMIN" ? "Администратор" : "Покупатель"}
                              </p>
                              <p style={{ fontSize: 12, color: "#1A1A1A", fontFamily: "Montserrat", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.email || "Мой аккаунт"}
                              </p>
                            </div>
                          </div>
                        </div>
                        {([
                          { to: "/cart", emoji: "🛍️", label: "Моя корзина" },
                          { to: "/orderHistory", emoji: "📋", label: "Мои заказы" },
                          ...(role === "ADMIN" ? [{ to: "/admin", emoji: "⚙️", label: "Панель Админа" }] : [])
                        ] as { to: string; emoji: string; label: string }[]).map(item => (
                          <Link key={item.to} to={item.to} className="profile-link" onClick={() => setShowProfile(false)}
                            style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 20px", textDecoration: "none", color: "#1A1A1A", fontFamily: "Montserrat", fontSize: 12, letterSpacing: 0.5, borderBottom: "1px solid #F7F4EF", transition: "background-color 0.15s" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#F7F4EF"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                          >
                            <span style={{ fontSize: 15 }}>{item.emoji}</span>{item.label}
                          </Link>
                        ))}
                        <button onClick={handleLogout} style={{ width: "100%", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, fontFamily: "Montserrat", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#FF0000", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background-color 0.15s" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF5F5"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Выйти
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Link to="/login" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "#FFFFFF", border: "1.5px solid #1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.22s", cursor: "pointer" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#8B0000"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1A1A1A"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                      >
                        <svg width="18" height="18" fill="none" stroke="#1A1A1A" strokeWidth="1.8" viewBox="0 0 24 24">
                          <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 7, letterSpacing: 2, color: "#555", fontFamily: "Montserrat", textTransform: "uppercase" }}>Войти</span>
                    </Link>
                    <Link to="/register" style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: "#FF0000", border: "1.5px solid #FF0000", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.22s", cursor: "pointer" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#8B0000"; (e.currentTarget as HTMLElement).style.borderColor = "#8B0000"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FF0000"; (e.currentTarget as HTMLElement).style.borderColor = "#FF0000"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                      >
                        <svg width="18" height="18" fill="none" stroke="#FFFFFF" strokeWidth="1.8" viewBox="0 0 24 24">
                          <circle cx="10" cy="8" r="4" /><path d="M2 20c0-4 3.6-7 8-7" /><line x1="19" y1="12" x2="19" y2="20" /><line x1="15" y1="16" x2="23" y2="16" />
                        </svg>
                      </div>
                      <span style={{ fontSize: 7, letterSpacing: 2, color: "#555", fontFamily: "Montserrat", textTransform: "uppercase" }}>Регистрация</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── Burger button (планшет/мобайл, не на /admin) ── */}
            {!isAdmin && (
              <button
                className={`burger-btn${mobileOpen ? " open" : ""}`}
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Меню"
              >
                <span /><span /><span />
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* ══ Mobile Drawer Overlay ══ */}
      {mobileOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ══ Mobile Drawer Panel ══ */}
      {mobileOpen && (
        <div className="mobile-drawer scroll-touch">

          {/* Шапка drawer */}
          <div className="drawer-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/image.png" alt="DORRO" style={{ width: 32, height: 32, objectFit: "contain" }} />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#8B0000", letterSpacing: 4, fontWeight: 600 }}>DORRO</span>
            </div>
            <button className="drawer-close" onClick={() => setMobileOpen(false)} aria-label="Закрыть">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Поиск и фильтры — только на главной */}
          {isHome && (
            <div className="drawer-filters">
              <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 4 }}>Поиск</p>
              <input
                placeholder="Поиск товаров..."
                value={searchParams.get("search") || ""}
                onChange={e => updateFilter("search", e.target.value)}
              />
              <select
                value={searchParams.get("category") || ""}
                onChange={e => { updateFilter("category", e.target.value); if (e.target.value) setMobileOpen(false); }}
              >
                <option value="">Все категории</option>
                <option value="Кроссовки">Кроссовки</option>
                <option value="Футболки">Футболки</option>
                <option value="Шорты">Шорты</option>
              </select>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  placeholder="от $"
                  value={searchParams.get("minPrice") || ""}
                  onChange={e => updateFilter("minPrice", e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="до $"
                  value={searchParams.get("maxPrice") || ""}
                  onChange={e => updateFilter("maxPrice", e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          )}

          {/* Навигация */}
          <div className="drawer-section">
            <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 12 }}>Навигация</p>
            <Link to="/" className="drawer-link" onClick={() => setMobileOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Каталог
            </Link>
            <Link to="/cart" className="drawer-link" onClick={() => setMobileOpen(false)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Корзина
              {totalCount > 0 && (
                <span style={{ marginLeft: "auto", backgroundColor: "#FF0000", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{totalCount}</span>
              )}
            </Link>
            {token && (
              <Link to="/orderHistory" className="drawer-link" onClick={() => setMobileOpen(false)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Мои заказы
              </Link>
            )}
            {token && role === "ADMIN" && (
              <Link to="/admin" className="drawer-link" onClick={() => setMobileOpen(false)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Панель Админа
              </Link>
            )}
          </div>

          {/* Авторизация */}
          <div className="drawer-section">
            {token ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "12px 0", borderBottom: "1px solid #F0ECE4" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#8B0000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: 2, color: "#888", fontFamily: "Montserrat", textTransform: "uppercase", margin: 0 }}>{role === "ADMIN" ? "Администратор" : "Покупатель"}</p>
                    <p style={{ fontSize: 12, color: "#1A1A1A", fontFamily: "Montserrat", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{user?.email || "Мой аккаунт"}</p>
                  </div>
                </div>
                <button onClick={handleLogout} style={{ width: "100%", padding: "12px 0", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: "#FF0000", fontFamily: "Montserrat", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Выйти
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link to="/login" className="btn-primary" style={{ textAlign: "center", display: "block" }} onClick={() => setMobileOpen(false)}>Войти</Link>
                <Link to="/register" className="btn-secondary" style={{ textAlign: "center", display: "block" }} onClick={() => setMobileOpen(false)}>Регистрация</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
