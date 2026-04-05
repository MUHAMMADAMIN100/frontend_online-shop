import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../utils/swal";
import type { AppDispatch, RootState } from "../app/store";
import { addToCart } from "../features/cart/cartSlice";
import LoadingLogo from "../components/LoadingLogo";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  const search   = searchParams.get("search")   || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    return true;
  });

  const handleAdd = async (productId: number) => {
    if (!token) {
      notify.warning("Войдите в аккаунт", "Для добавления товара необходима авторизация");
      return;
    }
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      notify.addedToCart();
    } catch {
      notify.error("Errore", "Не удалось добавить товар");
    }
  };

  if (loading) return <LoadingLogo height="80vh" />;

  return (
    <div style={{ backgroundColor: "#F7F4EF", minHeight: "100vh", padding: "60px 40px" }}>

      {/* Заголовок */}
      <div className="animate-slideInUp" style={{ textAlign: "center", marginBottom: 60 }}>
        <p style={{ fontSize: 10, letterSpacing: 5, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 12 }}>
          Collezione Primavera
        </p>
        <h1 className="serif" style={{ fontSize: 42, color: "#8B0000", letterSpacing: 4, fontWeight: 500, marginBottom: 16 }}>
          Наша Коллекция
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
          <div style={{ width: 40, height: 1, backgroundColor: "#008000" }} />
          <div style={{ width: 6, height: 6, backgroundColor: "#FF0000", borderRadius: "50%" }} />
          <div style={{ width: 40, height: 1, backgroundColor: "#FF0000" }} />
        </div>
        <p style={{ fontSize: 12, letterSpacing: 2, color: "#888", fontFamily: "Montserrat" }}>
          Итальянское качество · Спортивный стиль
        </p>
        {(search || category || minPrice || maxPrice) && (
          <p style={{ marginTop: 12, fontSize: 11, color: "#888", fontFamily: "Montserrat", letterSpacing: 1 }}>
            Найдено: <strong style={{ color: "#1A1A1A" }}>{filtered.length}</strong> товаров
          </p>
        )}
      </div>

      {/* Сетка товаров */}
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 28 }}>
        {filtered.map(product => (
          <div key={product.id} className="italian-card card-stagger" style={{ display: "flex", flexDirection: "column" }}>
            <Link to={`/product/${product.id}`} style={{ textDecoration: "none", display: "block" }}>
              {/* Фото */}
              <div style={{ position: "relative", overflow: "hidden", height: 260 }}>
                <img
                  src={product.image || "https://via.placeholder.com/400x300?text=DORRO"}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                />
                {product.category && (
                  <div style={{
                    position: "absolute", top: 12, left: 0,
                    backgroundColor: "#008000", color: "#FFFFFF",
                    padding: "4px 14px", fontSize: 9, letterSpacing: 3,
                    textTransform: "uppercase", fontFamily: "Montserrat", fontWeight: 600
                  }}>
                    {product.category}
                  </div>
                )}
                {/* Цветовые точки если есть */}
                {product.colors && product.colors.length > 0 && (
                  <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 5 }}>
                    {product.colors.slice(0, 5).map((c: any) => (
                      <div key={c.hex} style={{
                        width: 12, height: 12, borderRadius: "50%", backgroundColor: c.hex,
                        border: "1.5px solid rgba(255,255,255,0.8)"
                      }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Инфо */}
              <div style={{ padding: "20px 20px 12px" }}>
                <h3 className="serif" style={{ fontSize: 16, color: "#1A1A1A", marginBottom: 8, fontWeight: 500 }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: 11, color: "#888", lineHeight: 1.6, marginBottom: 12, fontFamily: "Montserrat" }}>
                  {product.description?.slice(0, 70)}{product.description?.length > 70 ? "..." : ""}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p className="serif" style={{ fontSize: 20, color: "#FF0000", fontWeight: 600 }}>
                    {product.price.toLocaleString()} ₽
                  </p>
                  {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                    <span style={{ fontSize: 9, color: "#CC8800", fontFamily: "Montserrat", letterSpacing: 1 }}>
                      Осталось {product.stock} шт
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span style={{ fontSize: 9, color: "#FF0000", fontFamily: "Montserrat", letterSpacing: 1 }}>
                      Нет в наличии
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Кнопка */}
            <div style={{ padding: "0 20px 20px", marginTop: "auto" }}>
              <button
                onClick={() => handleAdd(product.id)}
                disabled={product.stock === 0}
                className="btn-primary"
                style={{ width: "100%", textAlign: "center", opacity: product.stock === 0 ? 0.5 : 1 }}
              >
                {product.stock === 0 ? "Нет в наличии" : "В корзину"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="animate-fadeIn" style={{ textAlign: "center", padding: "80px 0" }}>
          <p className="serif" style={{ fontSize: 24, color: "#8B0000", marginBottom: 8 }}>
            {search || category || minPrice || maxPrice ? "Товары не найдены" : "Каталог пуст"}
          </p>
          <p style={{ fontSize: 11, letterSpacing: 2, color: "#888", fontFamily: "Montserrat" }}>
            {search || category || minPrice || maxPrice ? "Попробуйте изменить фильтры" : "Товары появятся здесь"}
          </p>
        </div>
      )}
    </div>
  );
}
