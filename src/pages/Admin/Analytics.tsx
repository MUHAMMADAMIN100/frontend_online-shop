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

const COLORS = ["#8B0000", "#FF0000", "#008000", "#1565C0", "#CC8800", "#6A0DAD", "#E65C00"];

// ── Bar Chart Component ──────────────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, colorFn, unit = "", maxBarHeight = 140 }: {
  data: any[];
  valueKey: string;
  labelKey: string;
  colorFn?: (i: number) => string;
  unit?: string;
  maxBarHeight?: number;
}) {
  if (!data.length) return <p style={{ color: "#888", fontSize: 12, fontFamily: "Montserrat" }}>Нет данных</p>;
  const maxVal = Math.max(...data.map(d => d[valueKey]), 1);
  const barWidth = Math.max(28, Math.min(52, Math.floor(560 / data.length) - 12));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        width={Math.max(data.length * (barWidth + 12), 300)}
        height={maxBarHeight + 72}
        style={{ display: "block" }}
      >
        {data.map((d, i) => {
          const barH = Math.max(4, Math.round((d[valueKey] / maxVal) * maxBarHeight));
          const x = i * (barWidth + 12) + 6;
          const y = maxBarHeight - barH + 4;
          const color = colorFn ? colorFn(i) : COLORS[i % COLORS.length];
          const label = String(d[labelKey]);
          const shortLabel = label.length > 10 ? label.slice(0, 9) + "…" : label;
          const valStr = unit === "₽" ? `${Number(d[valueKey]).toLocaleString("ru")}₽` : `${d[valueKey]}${unit}`;
          return (
            <g key={i}>
              {/* Bar */}
              <rect x={x} y={y} width={barWidth} height={barH} fill={color} rx={3} opacity={0.9} />
              {/* Value on top */}
              <text
                x={x + barWidth / 2} y={y - 4}
                textAnchor="middle" fontSize={9} fontFamily="Montserrat" fontWeight="600" fill="#1A1A1A"
              >
                {valStr}
              </text>
              {/* Label below */}
              <text
                x={x + barWidth / 2} y={maxBarHeight + 20}
                textAnchor="middle" fontSize={9} fontFamily="Montserrat" fill="#555"
              >
                {shortLabel}
              </text>
            </g>
          );
        })}
        {/* Baseline */}
        <line x1={0} y1={maxBarHeight + 4} x2={data.length * (barWidth + 12)} y2={maxBarHeight + 4} stroke="#D9CFC0" strokeWidth={1} />
      </svg>
    </div>
  );
}

// ── Donut Chart Component ────────────────────────────────────────────────────
function DonutChart({ data, valueKey, labelKey }: { data: any[]; valueKey: string; labelKey: string }) {
  if (!data.length) return <p style={{ color: "#888", fontSize: 12, fontFamily: "Montserrat" }}>Нет данных</p>;
  const total = data.reduce((s, d) => s + d[valueKey], 0) || 1;
  const cx = 90, cy = 90, r = 68, innerR = 40;
  let angle = -Math.PI / 2;

  const slices = data.map((d, i) => {
    const frac = d[valueKey] / total;
    const startAngle = angle;
    angle += frac * 2 * Math.PI;
    const endAngle = angle;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle), iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle), iy2 = cy + innerR * Math.sin(startAngle);
    const large = frac > 0.5 ? 1 : 0;
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
    return { path, color: COLORS[i % COLORS.length], label: d[labelKey], pct: Math.round(frac * 100), value: d[valueKey] };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width={180} height={180}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke="#fff" strokeWidth={2} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={11} fontFamily="Montserrat" fontWeight="600" fill="#1A1A1A">Итого</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={10} fontFamily="Montserrat" fill="#555">{total.toLocaleString("ru")} ₽</text>
      </svg>
      <div style={{ flex: 1, minWidth: 120 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: s.color, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 11, fontFamily: "Montserrat", color: "#1A1A1A", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{s.label}</p>
              <p style={{ fontSize: 10, fontFamily: "Montserrat", color: "#888", margin: 0 }}>{s.pct}% · {Number(s.value).toLocaleString("ru")} ₽</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Horizontal Bar ───────────────────────────────────────────────────────────
function HorizBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ flex: 1, height: 8, backgroundColor: "#F0ECE4", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "#1A1A1A" }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", padding: "20px 24px" }}>
    <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 8 }}>{label}</p>
    <p className="serif" style={{ fontSize: 28, color, fontWeight: 600, margin: 0 }}>{value}</p>
    {sub && <p style={{ fontSize: 10, color: "#888", fontFamily: "Montserrat", marginTop: 4 }}>{sub}</p>}
  </div>
);

// ── Chart Card ───────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", padding: "24px" }}>
    {subtitle && (
      <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 4 }}>{subtitle}</p>
    )}
    <p style={{ fontSize: 15, color: "#1A1A1A", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 18 }}>{title}</p>
    {children}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
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

  const maxSold = Math.max(...data.topProducts.map(p => p.sold), 1);

  // Сравнение месяцев для мини-диаграммы
  const monthCompare = [
    { label: "Прошлый месяц", revenue: data.lastMonth.revenue, orders: data.lastMonth.orders },
    { label: "Этот месяц", revenue: data.thisMonth.revenue, orders: data.thisMonth.orders },
  ];

  return (
    <div>
      {/* Заголовок */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 4 }}>Analisi</p>
        <h2 className="serif" style={{ fontSize: 24, color: "#8B0000", fontWeight: 500 }}>Аналитика</h2>
        <div style={{ width: 40, height: 2, backgroundColor: "#FF0000", marginTop: 8 }} />
      </div>

      {/* Карточки KPI */}
      <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#888", fontFamily: "Montserrat", marginBottom: 12 }}>Этот месяц</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 14 }}>
        <StatCard
          label="Доход"
          value={`${data.thisMonth.revenue.toLocaleString("ru")} ₽`}
          sub={revenueGrowth !== null ? `${revenueGrowth >= 0 ? "+" : ""}${revenueGrowth}% к прошлому` : undefined}
          color={revenueGrowth !== null && revenueGrowth >= 0 ? "#008000" : "#FF0000"}
        />
        <StatCard
          label="Заказы"
          value={data.thisMonth.orders}
          sub={ordersGrowth !== null ? `${ordersGrowth >= 0 ? "+" : ""}${ordersGrowth}% к прошлому` : undefined}
          color="#8B0000"
        />
        <StatCard label="Всего клиентов" value={data.totalStats.users} color="#1565C0" />
        <StatCard label="Всего товаров" value={data.totalStats.products} color="#2E7D32" />
        <StatCard label="Всего заказов" value={data.totalStats.orders} color="#8B0000" />
        <StatCard label="Общая выручка" value={`${data.totalStats.revenue.toLocaleString("ru")} ₽`} color="#FF0000" />
      </div>

      {/* Сравнение месяцев */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <ChartCard title="Выручка: этот vs прошлый месяц" subtitle="Сравнение">
          <BarChart
            data={monthCompare}
            valueKey="revenue"
            labelKey="label"
            unit="₽"
            colorFn={i => i === 1 ? "#8B0000" : "#D9CFC0"}
            maxBarHeight={120}
          />
        </ChartCard>

        <ChartCard title="Заказы: этот vs прошлый месяц" subtitle="Сравнение">
          <BarChart
            data={monthCompare}
            valueKey="orders"
            labelKey="label"
            unit=" шт"
            colorFn={i => i === 1 ? "#008000" : "#D9CFC0"}
            maxBarHeight={120}
          />
        </ChartCard>
      </div>

      {/* Графики по продуктам */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <ChartCard title="Продано единиц (топ товары)" subtitle="Продажи">
          <BarChart
            data={data.topProducts}
            valueKey="sold"
            labelKey="name"
            unit=" шт"
            maxBarHeight={140}
          />
        </ChartCard>

        <ChartCard title="Выручка по товарам" subtitle="Доход">
          <BarChart
            data={data.topProducts}
            valueKey="revenue"
            labelKey="name"
            unit="₽"
            maxBarHeight={140}
          />
        </ChartCard>
      </div>

      {/* Пирог + остатки */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <ChartCard title="Доля выручки по товарам" subtitle="Распределение">
          <DonutChart data={data.topProducts} valueKey="revenue" labelKey="name" />
        </ChartCard>

        <ChartCard title="Остатки на складе" subtitle="Запасы">
          <BarChart
            data={data.topProducts}
            valueKey="stock"
            labelKey="name"
            unit=" шт"
            colorFn={i => {
              const s = data.topProducts[i]?.stock ?? 0;
              return s === 0 ? "#FF0000" : s <= 5 ? "#CC8800" : "#008000";
            }}
            maxBarHeight={140}
          />
        </ChartCard>
      </div>

      {/* Детальная таблица по продуктам */}
      <ChartCard title="Подробная таблица по товарам" subtitle="Детали">
        {data.topProducts.length === 0 ? (
          <p style={{ color: "#888", fontSize: 12, fontFamily: "Montserrat" }}>Нет данных о продажах</p>
        ) : (
          <div>
            {/* Заголовок таблицы */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, padding: "0 0 10px", borderBottom: "2px solid #F0ECE4", marginBottom: 10 }}>
              {["Товар", "Продано", "Выручка", "Склад", "Доля продаж"].map(h => (
                <p key={h} style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#888", fontFamily: "Montserrat", fontWeight: 600, margin: 0 }}>{h}</p>
              ))}
            </div>
            {data.topProducts.map((p, i) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: i < data.topProducts.length - 1 ? "1px solid #F7F4EF" : "none" }}>
                {/* Название */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", backgroundColor: COLORS[i % COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "Montserrat", color: "#1A1A1A", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                </div>
                {/* Продано */}
                <p style={{ fontSize: 13, fontFamily: "Montserrat", fontWeight: 700, color: "#8B0000", margin: 0 }}>{p.sold} шт</p>
                {/* Выручка */}
                <p style={{ fontSize: 12, fontFamily: "Montserrat", color: "#1A1A1A", margin: 0 }}>{p.revenue.toLocaleString("ru")} ₽</p>
                {/* Склад */}
                <span style={{
                  fontSize: 11, fontWeight: 700, fontFamily: "Montserrat",
                  color: p.stock === 0 ? "#fff" : p.stock <= 5 ? "#CC8800" : "#008000",
                  backgroundColor: p.stock === 0 ? "#FF0000" : "transparent",
                  padding: p.stock === 0 ? "2px 8px" : 0,
                  display: "inline-block"
                }}>
                  {p.stock === 0 ? "Нет" : `${p.stock} шт`}
                </span>
                {/* Горизонтальный бар продаж */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <HorizBar value={p.sold} max={maxSold} color={COLORS[i % COLORS.length]} />
                  <span style={{ fontSize: 10, fontFamily: "Montserrat", color: "#888", flexShrink: 0, minWidth: 28 }}>
                    {maxSold > 0 ? Math.round((p.sold / maxSold) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>

      {/* Критические остатки */}
      {data.stockAlerts.length > 0 && (
        <div style={{ backgroundColor: "#FFF5F5", border: "1px solid #FFCDD2", padding: "20px 24px", marginTop: 20 }}>
          <p style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#FF0000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 14 }}>
            Требуют пополнения ({data.stockAlerts.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {data.stockAlerts.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: "#fff", border: "1px solid #FFCDD2", padding: "8px 14px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: p.stock === 0 ? "#FF0000" : "#CC8800" }} />
                <span style={{ fontSize: 12, fontFamily: "Montserrat", color: "#1A1A1A" }}>{p.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "Montserrat", color: p.stock === 0 ? "#FF0000" : "#CC8800" }}>
                  {p.stock === 0 ? "Нет в наличии" : `${p.stock} шт`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
