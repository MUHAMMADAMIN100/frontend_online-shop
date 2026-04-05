import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import LoadingLogo from "../../components/LoadingLogo";

interface AnalyticsData {
  thisMonth: { orders: number; revenue: number };
  lastMonth: { orders: number; revenue: number };
  topProducts: { id: number; name: string; sold: number; revenue: number; stock: number }[];
  stockAlerts: { id: number; name: string; stock: number }[];
  totalStats: { users: number; products: number; orders: number; revenue: number };
}

const StatCard = ({ label, value, sub, color = "#1A1A1A" }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", padding: "24px 28px" }}>
    <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 10 }}>{label}</p>
    <p className="serif" style={{ fontSize: 32, color, fontWeight: 600, margin: 0 }}>{value}</p>
    {sub && <p style={{ fontSize: 10, color: "#888", fontFamily: "Montserrat", marginTop: 6 }}>{sub}</p>}
  </div>
);

export default function Analytics() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingLogo height="300px" size={64} />;
  if (!data) return (
    <p style={{ textAlign: "center", color: "#888", fontFamily: "Montserrat", padding: 40 }}>Не удалось загрузить аналитику</p>
  );

  const revenueGrowth = data.lastMonth.revenue > 0
    ? Math.round(((data.thisMonth.revenue - data.lastMonth.revenue) / data.lastMonth.revenue) * 100)
    : null;

  const ordersGrowth = data.lastMonth.orders > 0
    ? Math.round(((data.thisMonth.orders - data.lastMonth.orders) / data.lastMonth.orders) * 100)
    : null;

  const growthStyle = (v: number | null) => ({
    color: v === null ? "#888" : v >= 0 ? "#008000" : "#FF0000"
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 4 }}>Analisi</p>
        <h2 className="serif" style={{ fontSize: 24, color: "#8B0000", fontWeight: 500 }}>Аналитика</h2>
        <div style={{ width: 40, height: 2, backgroundColor: "#FF0000", marginTop: 8 }} />
      </div>

      {/* Текущий месяц */}
      <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "Montserrat", marginBottom: 14 }}>
        Этот месяц
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        <StatCard
          label="Доход"
          value={`${data.thisMonth.revenue.toLocaleString()} ₽`}
          sub={revenueGrowth !== null ? `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% к прошлому месяцу` : undefined}
          color={revenueGrowth !== null && revenueGrowth >= 0 ? "#008000" : "#FF0000"}
        />
        <StatCard
          label="Заказы"
          value={data.thisMonth.orders}
          sub={ordersGrowth !== null ? `${ordersGrowth >= 0 ? "+" : ""}${ordersGrowth}% к прошлому месяцу` : undefined}
          color="#8B0000"
        />
        <StatCard label="Прошлый месяц доход" value={`${data.lastMonth.revenue.toLocaleString()} ₽`} color="#888" />
        <StatCard label="Прошлый месяц заказы" value={data.lastMonth.orders} color="#888" />
      </div>

      {/* Общая статистика */}
      <p style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "Montserrat", marginBottom: 14 }}>
        Всего за всё время
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Клиентов" value={data.totalStats.users} color="#1565C0" />
        <StatCard label="Товаров" value={data.totalStats.products} color="#2E7D32" />
        <StatCard label="Заказов" value={data.totalStats.orders} color="#8B0000" />
        <StatCard label="Выручка" value={`${data.totalStats.revenue.toLocaleString()} ₽`} color="#FF0000" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, flexWrap: "wrap" }}>
        {/* Топ продаж */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", padding: "24px" }}>
          <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 16 }}>
            Топ продаж
          </p>
          {data.topProducts.length === 0 && (
            <p style={{ color: "#888", fontSize: 12, fontFamily: "Montserrat" }}>Нет данных</p>
          )}
          {data.topProducts.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: i < data.topProducts.length - 1 ? "1px solid #F0ECE4" : "none" }}>
              <div style={{ width: 28, height: 28, backgroundColor: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#F7F4EF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1A1A" }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "#1A1A1A", fontFamily: "Montserrat", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{p.name}</p>
                <p style={{ fontSize: 10, color: "#888", fontFamily: "Montserrat", margin: 0 }}>
                  Продано: {p.sold} шт · {p.revenue.toLocaleString()} ₽
                </p>
              </div>
              <span style={{ fontSize: 12, color: (p.stock ?? 0) <= 5 ? "#FF0000" : "#008000", fontFamily: "Montserrat", fontWeight: 600, flexShrink: 0 }}>
                {p.stock ?? 0} шт
              </span>
            </div>
          ))}
        </div>

        {/* Критические остатки */}
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", padding: "24px" }}>
          <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#FF0000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 16 }}>
            Требуют пополнения
          </p>
          {data.stockAlerts.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#008000" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <p style={{ fontSize: 13, fontFamily: "Montserrat", margin: 0 }}>Все товары в наличии</p>
            </div>
          ) : (
            data.stockAlerts.map((p, i) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: i < data.stockAlerts.length - 1 ? "1px solid #F0ECE4" : "none" }}>
                <p style={{ fontSize: 13, color: "#1A1A1A", fontFamily: "Montserrat", margin: 0, fontWeight: 500 }}>{p.name}</p>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#FFFFFF", fontFamily: "Montserrat",
                  backgroundColor: p.stock === 0 ? "#FF0000" : "#CC8800",
                  padding: "3px 10px"
                }}>
                  {p.stock === 0 ? "Нет" : `${p.stock} шт`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
