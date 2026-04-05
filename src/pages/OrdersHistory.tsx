import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import LoadingLogo from "../components/LoadingLogo";
import { cacheGet, cacheSet } from "../utils/cache";

interface OrderItem { id: number; product: { id: number; name: string; price: number; image?: string }; quantity: number; price: number; }
interface Order { id: number; createdAt: string; items: OrderItem[]; }

const OrdersHistory: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>(() => cacheGet<Order[]>("orders") ?? []);
  const [loading, setLoading] = useState(() => !cacheGet("orders"));

  useEffect(() => {
    if (!token) return;
    // Всегда обновляем в фоне
    fetch(`${import.meta.env.VITE_API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => { setOrders(data); cacheSet("orders", data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <LoadingLogo height="60vh" />
    </div>
  );

  return (
    <div className="page-wrapper">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#008000', fontFamily: 'Montserrat', fontWeight: 600, marginBottom: 12 }}>
            Ваши заказы
          </p>
          <h1 className="serif" style={{ fontSize: 36, color: '#8B0000', letterSpacing: 4, fontWeight: 500, marginBottom: 8 }}>
            История Заказов
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 30, height: 1, backgroundColor: '#008000' }} />
            <div style={{ width: 5, height: 5, backgroundColor: '#FF0000', borderRadius: '50%' }} />
            <div style={{ width: 30, height: 1, backgroundColor: '#FF0000' }} />
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0' }}>
            <p className="serif" style={{ fontSize: 22, color: '#8B0000', marginBottom: 8 }}>Заказов пока нет</p>
            <p style={{ fontSize: 11, color: '#888', fontFamily: 'Montserrat', letterSpacing: 2 }}>Оформите свой первый заказ</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {orders.map(order => (
              <div key={order.id} className="italian-card" style={{ padding: '28px 32px' }}>
                <div className="order-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '1px solid #D9CFC0', paddingBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontFamily: 'Montserrat', marginBottom: 4 }}>Заказ</p>
                    <h3 className="serif" style={{ fontSize: 20, color: '#8B0000', fontWeight: 500 }}>№ {order.id}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontFamily: 'Montserrat', marginBottom: 4 }}>Дата</p>
                    <p style={{ fontSize: 13, color: '#555', fontFamily: 'Montserrat' }}>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {order.items.map(item => (
                    <div key={item.id} className="order-item-row" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <img src={item.product.image || "https://via.placeholder.com/60"} alt={item.product.name} style={{ width: 60, height: 60, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <p className="serif" style={{ fontSize: 15, color: '#1A1A1A', fontWeight: 500 }}>{item.product.name}</p>
                        <p style={{ fontSize: 11, color: '#888', fontFamily: 'Montserrat' }}>{item.quantity} × {item.price.toLocaleString()} ₽</p>
                      </div>
                      <p className="serif" style={{ fontSize: 16, color: '#FF0000', fontWeight: 600 }}>{(item.quantity * item.price).toLocaleString()} ₽</p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #D9CFC0', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontFamily: 'Montserrat', marginBottom: 4 }}>Итого</p>
                    <p className="serif" style={{ fontSize: 24, color: '#FF0000', fontWeight: 600 }}>
                      {order.items.reduce((s, i) => s + i.quantity * i.price, 0).toLocaleString()} ₽
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersHistory;
