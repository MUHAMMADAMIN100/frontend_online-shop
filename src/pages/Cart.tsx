import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { notify } from "../utils/swal";
import { fetchCart, addToCart, removeFromCart, clearCart, optimisticRemove, localClearCart } from "../features/cart/cartSlice";
import type { RootState } from "../app/store";
import LoadingLogo from "../components/LoadingLogo";
import DeliveryMap from "../components/DeliveryMap";
import { cacheInvalidate } from "../utils/cache";

const Cart: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const items = useSelector((state: RootState) => state.cart.items);
  const { token } = useSelector((state: RootState) => state.auth);

  const [initialLoad, setInitialLoad] = useState(true);
  const [localQty, setLocalQty] = useState<Record<number, number>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Счётчик активных запросов — пока > 0, не синхронизируем localQty с Redux
  const [pendingOps, setPendingOps] = useState(0);

  // Реф для дедупликации синхронизации
  const pendingOpsRef = useRef(0);

  useEffect(() => {
    dispatch(fetchCart()).finally(() => setInitialLoad(false));
  }, [dispatch]);

  // Синхронизируем localQty только когда нет активных запросов
  useEffect(() => {
    if (!initialLoad && pendingOps === 0) {
      const q: Record<number, number> = {};
      items.forEach(item => { q[item.productId] = item.quantity; });
      setLocalQty(q);
    }
  }, [items, initialLoad, pendingOps]);

  const handleAdd = useCallback(async (cartItemId: number, productId: number, size?: string, color?: string) => {
    // Мгновенный UI
    setLocalQty(prev => ({ ...prev, [cartItemId]: (prev[productId] || 1) + 1 }));
    pendingOpsRef.current++;
    setPendingOps(p => p + 1);
    try {
      await dispatch(addToCart({ productId, quantity: 1, size, color }));
    } finally {
      pendingOpsRef.current = Math.max(0, pendingOpsRef.current - 1);
      setPendingOps(p => Math.max(0, p - 1));
    }
  }, [dispatch]);

  const handleRemove = useCallback(async (productId: number, size?: string, color?: string) => {
    const currentQty = localQty[productId] || 1;
    if (currentQty > 1) {
      setLocalQty(prev => ({ ...prev, [productId]: currentQty - 1 }));
      pendingOpsRef.current++;
      setPendingOps(p => p + 1);
      try {
        await dispatch(addToCart({ productId, quantity: -1, size, color }));
      } finally {
        pendingOpsRef.current = Math.max(0, pendingOpsRef.current - 1);
        setPendingOps(p => Math.max(0, p - 1));
      }
    } else {
      const item = items.find(i => i.productId === productId && (i.size ?? null) === (size ?? null) && (i.color ?? null) === (color ?? null));
      if (item) {
        setLocalQty(prev => { const next = { ...prev }; delete next[productId]; return next; });
        dispatch(removeFromCart(item.id));
      }
    }
  }, [dispatch, localQty, items]);

  const handleDelete = useCallback((cartItemId: number, productId: number) => {
    // Мгновенное удаление из UI
    setLocalQty(prev => { const next = { ...prev }; delete next[productId]; return next; });
    dispatch(optimisticRemove(cartItemId));
    // Фоновая синхронизация с сервером
    dispatch(removeFromCart(cartItemId));
  }, [dispatch]);

  const handleClear = () => {
    notify.confirm("Очистить корзину?", "Все товары будут удалены")
      .then(r => { if (r.isConfirmed) { setLocalQty({}); dispatch(clearCart()); } });
  };

  const totalPrice = items.reduce((sum, item) => {
    const qty = localQty[item.productId] ?? item.quantity;
    return sum + qty * item.product.price;
  }, 0);

  const handleCheckout = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      notify.warning("Заполните все поля", "Имя, телефон и адрес обязательны");
      return;
    }

    // Захватываем данные до очистки
    const orderItems = items.map(i => ({ productId: i.productId, quantity: localQty[i.productId] ?? i.quantity }));
    const [orderName, orderPhone, orderAddress] = [name, phone, address];

    // Мгновенно обновляем UI — не ждём сервер
    setShowCheckout(false);
    setShowMap(false);
    setLocalQty({});
    dispatch(localClearCart());
    setOrderCompleted(true);
    setName(""); setPhone(""); setAddress("");
    cacheInvalidate("orders"); // сбрасываем кэш истории заказов
    notify.success("Заказ оформлен!", "Ваш заказ успешно принят");

    // Запрос идёт в фоне
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customerName: orderName, phone: orderPhone, address: orderAddress, items: orderItems }),
      });
      if (!response.ok) {
        notify.error("Ошибка заказа", "Заказ не был создан — попробуйте снова");
        setOrderCompleted(false);
      }
    } catch {
      notify.error("Ошибка соединения", "Проверьте интернет и попробуйте снова");
      setOrderCompleted(false);
    }
  };

  if (initialLoad) return <LoadingLogo height="50vh" />;

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ← Главное меню */}
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#555", fontFamily: "Montserrat", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#8B0000"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#555"}>
          <i className="fas fa-arrow-left" style={{ fontSize: 12 }} />
          Главное меню
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="serif" style={{ fontSize: 36, color: '#8B0000', letterSpacing: 4, fontWeight: 500, marginBottom: 8 }}>
            Корзина
          </h1>
          <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#888', fontFamily: 'Montserrat' }}>Ваша корзина</p>
        </div>

        {items.length === 0 && !orderCompleted ? (
          <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0' }}>
            <p className="serif" style={{ fontSize: 22, color: '#8B0000', marginBottom: 8 }}>Корзина пуста</p>
            <p style={{ fontSize: 11, color: '#888', fontFamily: 'Montserrat', letterSpacing: 2 }}>Добавьте товары из каталога</p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items.map((item) => {
                  const qty = localQty[item.productId] ?? item.quantity;
                  return (
                    <div key={item.id} className="italian-card cart-item" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 28px' }}>
                      <img src={item.product.image || "https://placehold.co/80x80"} alt={item.product.name}
                        style={{ width: 80, height: 80, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h3 className="serif" style={{ fontSize: 16, color: '#1A1A1A', fontWeight: 500, marginBottom: 4 }}>{item.product.name}</h3>
                        <p style={{ fontSize: 14, color: '#008000', fontFamily: 'Montserrat', fontWeight: 600 }}>{item.product.price.toLocaleString()} $</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                          {item.size && (
                            <span style={{ fontSize: 10, fontFamily: 'Montserrat', letterSpacing: 1, color: '#555', backgroundColor: '#F7F4EF', border: '1px solid #D9CFC0', padding: '2px 8px' }}>
                              {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span style={{ fontSize: 10, fontFamily: 'Montserrat', letterSpacing: 1, color: '#555', backgroundColor: '#F7F4EF', border: '1px solid #D9CFC0', padding: '2px 8px' }}>
                              {item.color}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: '#888', fontFamily: 'Montserrat', letterSpacing: 1, marginTop: 4 }}>Кол-во: {qty}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* + */}
                        <button onClick={() => handleAdd(item.id, item.productId, item.size, item.color)}
                          style={{ width: 34, height: 34, backgroundColor: '#008000', color: '#fff', border: 'none', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                          title="Добавить">
                          +
                        </button>
                        {/* − */}
                        <button onClick={() => handleRemove(item.productId, item.size, item.color)}
                          style={{ width: 34, height: 34, backgroundColor: '#888', color: '#fff', border: 'none', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                          title="Убрать">
                          −
                        </button>
                        {/* ✕ */}
                        <button onClick={() => handleDelete(item.id, item.productId)}
                          style={{ width: 34, height: 34, backgroundColor: '#FF0000', color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Удалить">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <p className="serif" style={{ fontSize: 18, color: '#008000', fontWeight: 600, minWidth: 100, textAlign: 'right' }}>
                        {(qty * item.product.price).toLocaleString()} $
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="cart-footer" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', padding: '28px 32px', marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontFamily: 'Montserrat', marginBottom: 4 }}>Итого</p>
                <p className="serif" style={{ fontSize: 28, color: '#008000', fontWeight: 600 }}>{totalPrice.toLocaleString()} $</p>
              </div>
              <div className="cart-footer-buttons" style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleClear} className="btn-secondary">Очистить</button>
                <button onClick={() => setShowCheckout(true)} className="btn-primary">Оформить заказ</button>
              </div>
            </div>
          </>
        )}

        {orderCompleted && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button onClick={() => navigate("/orderHistory")} className="btn-green">Посмотреть заказы</button>
          </div>
        )}
      </div>

      {/* ══ Модальное окно оформления заказа ══ */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="animate-scaleUp checkout-modal scroll-touch" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', padding: '32px 28px', width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto' }}>

            {/* Заголовок */}
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <h2 className="serif" style={{ fontSize: 22, color: '#8B0000', letterSpacing: 3, fontWeight: 500, marginBottom: 10 }}>Оформление заказа</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ width: 20, height: 1, backgroundColor: '#008000' }} />
                <div style={{ width: 4, height: 4, backgroundColor: '#FF0000', borderRadius: '50%' }} />
                <div style={{ width: 20, height: 1, backgroundColor: '#FF0000' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Имя + телефон в ряд */}
              <div className="checkout-name-phone" style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder="Имя"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ flex: 1, border: '1px solid #D9CFC0', padding: '10px 12px', fontFamily: 'Montserrat', fontSize: 13, outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')}
                  onBlur={e => (e.target.style.borderColor = '#D9CFC0')}
                />
                <input
                  placeholder="Телефон"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ flex: 1, border: '1px solid #D9CFC0', padding: '10px 12px', fontFamily: 'Montserrat', fontSize: 13, outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')}
                  onBlur={e => (e.target.style.borderColor = '#D9CFC0')}
                />
              </div>

              {/* Адрес — ввод + кнопка открыть карту */}
              <div style={{ position: 'relative' }}>
                <input
                  placeholder="Адрес доставки"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  style={{ width: '100%', border: '1px solid #D9CFC0', padding: '10px 44px 10px 12px', fontFamily: 'Montserrat', fontSize: 13, outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')}
                  onBlur={e => (e.target.style.borderColor = '#D9CFC0')}
                />
                {/* Иконка карты */}
                <button
                  type="button"
                  onClick={() => setShowMap(m => !m)}
                  title={showMap ? "Скрыть карту" : "Выбрать на карте"}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: showMap ? '#8B0000' : '#888', padding: 4 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </button>
              </div>

              {/* Карта — раскрывается по кнопке */}
              {showMap && (
                <div className="animate-fadeIn">
                  <DeliveryMap onAddressChange={(addr) => { setAddress(addr); }} />
                </div>
              )}

              {/* Итого */}
              <div style={{ backgroundColor: '#F7F4EF', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#888', fontFamily: 'Montserrat' }}>Итого</span>
                <span className="serif" style={{ fontSize: 22, color: '#008000', fontWeight: 600 }}>{totalPrice.toLocaleString()} $</span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleCheckout}
                  className="btn-primary"
                  style={{ flex: 2, textAlign: 'center' }}
                >
                  Создать заказ
                </button>
                <button onClick={() => { setShowCheckout(false); setShowMap(false); }} className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
