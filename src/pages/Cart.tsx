import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/swal";
import { fetchCart, addToCart, removeFromCart, clearCart } from "../features/cart/cartSlice";
import type { RootState } from "../app/store";

const Cart: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  // Читаем только items — не подписываемся на loading чтобы избежать ре-рендеров
  const items = useSelector((state: RootState) => state.cart.items);
  const { token } = useSelector((state: RootState) => state.auth);

  const [initialLoad, setInitialLoad] = useState(true);
  // Локальные количества для мгновенного UI-обновления
  const [localQty, setLocalQty] = useState<Record<number, number>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  // Начальная загрузка корзины
  useEffect(() => {
    dispatch(fetchCart()).finally(() => setInitialLoad(false));
  }, [dispatch]);

  // Синхронизируем локальные qty с Redux (после fulfilled)
  useEffect(() => {
    if (!initialLoad) {
      const q: Record<number, number> = {};
      items.forEach(item => { q[item.productId] = item.quantity; });
      setLocalQty(q);
    }
  }, [items, initialLoad]);

  const handleAdd = useCallback((productId: number) => {
    // Мгновенно обновляем UI
    setLocalQty(prev => ({ ...prev, [productId]: (prev[productId] || 1) + 1 }));
    // Отправляем в фоне
    dispatch(addToCart({ productId, quantity: 1 }));
  }, [dispatch]);

  const handleRemove = useCallback((productId: number) => {
    const currentQty = localQty[productId] || 1;
    if (currentQty > 1) {
      setLocalQty(prev => ({ ...prev, [productId]: currentQty - 1 }));
      dispatch(addToCart({ productId, quantity: -1 }));
    } else {
      const item = items.find(i => i.productId === productId);
      if (item) dispatch(removeFromCart(item.id));
    }
  }, [dispatch, localQty, items]);

  const handleDelete = useCallback((cartItemId: number, productId: number) => {
    setLocalQty(prev => { const next = { ...prev }; delete next[productId]; return next; });
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
    if (!name || !phone || !address) {
      notify.warning("Заполните все поля", "Имя, телефон и адрес обязательны");
      return;
    }
    setOrderLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerName: name, phone, address,
          items: items.map(i => ({ productId: i.productId, quantity: localQty[i.productId] ?? i.quantity }))
        }),
      });
      if (response.ok) {
        setShowCheckout(false);
        await notify.orderCreated();
        setLocalQty({});
        dispatch(clearCart());
        setOrderCompleted(true);
        setName(""); setPhone(""); setAddress("");
      } else {
        notify.error("Errore", "Не удалось создать заказ");
      }
    } catch {
      notify.error("Errore", "Не удалось создать заказ");
    } finally { setOrderLoading(false); }
  };

  if (initialLoad) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <p className="serif" style={{ color: '#8B0000', fontSize: 18, letterSpacing: 3 }}>Caricamento...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F7F4EF', minHeight: '100vh', padding: '60px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 className="serif" style={{ fontSize: 36, color: '#8B0000', letterSpacing: 4, fontWeight: 500, marginBottom: 8 }}>
            Il Carrello
          </h1>
          <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#888', fontFamily: 'Montserrat' }}>Ваша корзина</p>
        </div>

        {items.length === 0 && !orderCompleted ? (
          <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0' }}>
            <p className="serif" style={{ fontSize: 22, color: '#8B0000', marginBottom: 8 }}>Корзина пуста</p>
            <p style={{ fontSize: 11, color: '#888', fontFamily: 'Montserrat', letterSpacing: 2 }}>Il carrello è vuoto</p>
          </div>
        ) : (
          <>
            {items.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {items.map((item) => {
                  const qty = localQty[item.productId] ?? item.quantity;
                  return (
                    <div key={item.id} className="italian-card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 28px' }}>
                      <img src={item.product.image || "https://via.placeholder.com/80"} alt={item.product.name}
                        style={{ width: 80, height: 80, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <h3 className="serif" style={{ fontSize: 16, color: '#1A1A1A', fontWeight: 500, marginBottom: 4 }}>{item.product.name}</h3>
                        <p style={{ fontSize: 14, color: '#FF0000', fontFamily: 'Montserrat', fontWeight: 600 }}>{item.product.price.toLocaleString()} ₽</p>
                        <p style={{ fontSize: 11, color: '#888', fontFamily: 'Montserrat', letterSpacing: 1 }}>Кол-во: {qty}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => handleAdd(item.productId)} style={{ width: 32, height: 32, backgroundColor: '#008000', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer', fontFamily: 'Montserrat', lineHeight: 1 }}>+</button>
                        <button onClick={() => handleRemove(item.productId)} style={{ width: 32, height: 32, backgroundColor: '#888', color: '#fff', border: 'none', fontSize: 18, cursor: 'pointer', fontFamily: 'Montserrat', lineHeight: 1 }}>−</button>
                        <button onClick={() => handleDelete(item.id, item.productId)} style={{ width: 32, height: 32, backgroundColor: '#FF0000', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: 'Montserrat' }}>✕</button>
                      </div>
                      <p className="serif" style={{ fontSize: 18, color: '#1A1A1A', fontWeight: 600, minWidth: 100, textAlign: 'right' }}>
                        {(qty * item.product.price).toLocaleString()} ₽
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', padding: '28px 32px', marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontFamily: 'Montserrat', marginBottom: 4 }}>Totale</p>
                <p className="serif" style={{ fontSize: 28, color: '#FF0000', fontWeight: 600 }}>{totalPrice.toLocaleString()} ₽</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
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

      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="animate-scaleUp" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', padding: '48px 40px', width: '100%', maxWidth: 480 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 className="serif" style={{ fontSize: 24, color: '#8B0000', letterSpacing: 3, fontWeight: 500 }}>Форма заказа</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }}>
                <div style={{ width: 20, height: 1, backgroundColor: '#008000' }} />
                <div style={{ width: 4, height: 4, backgroundColor: '#FF0000', borderRadius: '50%' }} />
                <div style={{ width: 20, height: 1, backgroundColor: '#FF0000' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input placeholder="Имя" value={name} onChange={e => setName(e.target.value)} />
              <input placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)} />
              <input placeholder="Адрес доставки" value={address} onChange={e => setAddress(e.target.value)} />
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={handleCheckout} disabled={orderLoading} className="btn-primary" style={{ flex: 1, textAlign: 'center', opacity: orderLoading ? 0.7 : 1 }}>
                  {orderLoading ? "..." : "Создать заказ"}
                </button>
                <button onClick={() => setShowCheckout(false)} className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
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
