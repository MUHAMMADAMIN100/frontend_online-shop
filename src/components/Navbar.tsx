import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";

export default function Navbar() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { token, role } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header>
      {/* Итальянский триколор */}
      <div className="tricolor" />

      {/* Верхняя строка */}
      <div style={{ backgroundColor: '#8B0000', padding: '6px 0', textAlign: 'center' }}>
        <span style={{ color: '#FFFFFF', fontSize: 10, letterSpacing: 4, fontFamily: 'Montserrat', textTransform: 'uppercase' }}>
          Итальянский Спортивный Ателье · Бесплатная доставка от 5000₽
        </span>
      </div>

      {/* Основной navbar */}
      <nav style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #D9CFC0', padding: '20px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Лого */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <img src="/image.png" alt="DORRO" style={{ width: 64, height: 64, objectFit: 'contain' }} />
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26, letterSpacing: 8,
              color: '#8B0000', fontWeight: 600,
              lineHeight: 1, marginTop: 2
            }}>
              DORRO
            </span>
            <div style={{ width: '100%', height: 1, backgroundColor: '#8B0000', margin: '3px 0' }} />
            <span style={{ fontSize: 7, letterSpacing: 4, color: '#8B0000', fontFamily: 'Montserrat', textTransform: 'uppercase' }}>
              Italian Atelier
            </span>
            <span style={{ fontSize: 7, letterSpacing: 3, color: '#8B0000', fontFamily: 'Montserrat' }}>
              1991
            </span>
          </Link>

          {/* Навигация */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>

            {/* Корзина */}
            <Link to="/cart" style={{ position: 'relative', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <svg width="22" height="22" fill="none" stroke="#1A1A1A" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', fontFamily: 'Montserrat' }}>Корзина</span>
              {totalCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  backgroundColor: '#FF0000', color: '#fff',
                  borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700
                }}>
                  {totalCount}
                </span>
              )}
            </Link>

            {/* История заказов */}
            {token && (
              <Link to="/orderHistory" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <svg width="22" height="22" fill="none" stroke="#1A1A1A" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="16" x2="12" y2="16" />
                </svg>
                <span style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#555', fontFamily: 'Montserrat' }}>Заказы</span>
              </Link>
            )}

            {/* Разделитель */}
            <div style={{ width: 1, height: 40, backgroundColor: '#D9CFC0' }} />

            {token ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                {role === 'ADMIN' && (
                  <Link to="/admin" style={{
                    textDecoration: 'none', fontSize: 10, letterSpacing: 3,
                    textTransform: 'uppercase', color: '#008000', fontFamily: 'Montserrat', fontWeight: 600
                  }}>
                    Панель Админа
                  </Link>
                )}
                <button onClick={handleLogout} style={{
                  border: '1px solid #8B0000', color: '#8B0000',
                  padding: '8px 24px', fontFamily: 'Montserrat', fontSize: 10,
                  letterSpacing: 3, textTransform: 'uppercase', cursor: 'pointer',
                  background: 'transparent', transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = '#8B0000'; (e.target as HTMLElement).style.color = '#FFFFFF'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; (e.target as HTMLElement).style.color = '#8B0000'; }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Link to="/login" style={{
                  textDecoration: 'none', fontSize: 10, letterSpacing: 3,
                  textTransform: 'uppercase', color: '#1A1A1A', fontFamily: 'Montserrat', fontWeight: 500
                }}>
                  Войти
                </Link>
                <Link to="/register" style={{
                  textDecoration: 'none', backgroundColor: '#FF0000', color: '#FFFFFF',
                  padding: '10px 28px', fontFamily: 'Montserrat', fontSize: 10,
                  letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600,
                  transition: 'background-color 0.2s'
                }}>
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
