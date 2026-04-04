import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../utils/swal";
import type { AppDispatch, RootState } from "../app/store";
import { addToCart } from "../features/cart/cartSlice";

interface ColorVariant {
  name: string;
  hex: string;
  images: string[];
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  colors?: ColorVariant[];
  sizes?: string[];
  stock?: number;
}

const IMG_H = 520;

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct]         = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [selectedSize, setSelectedSize]   = useState<string | null>(null);
  const [activeImage, setActiveImage]     = useState<string>("");
  const [imgFading, setImgFading]         = useState(false);
  const [addingToCart, setAddingToCart]   = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const token    = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then(res => {
        const p: Product = res.data;
        setProduct(p);
        const first = p.colors?.[0] ?? null;
        setSelectedColor(first);
        setActiveImage(first?.images?.[0] || p.image || "");
        setSelectedSize(null);
      })
      .catch(console.error);
  }, [id]);

  /** Плавная смена картинки */
  const switchImage = (url: string) => {
    if (url === activeImage) return;
    setImgFading(true);
    setTimeout(() => { setActiveImage(url); setImgFading(false); }, 180);
  };

  const handleColorSelect = (color: ColorVariant) => {
    setSelectedColor(color);
    switchImage(color.images?.[0] || product?.image || "");
  };

  const handleAdd = async () => {
    if (!token) {
      notify.warning("Войдите в аккаунт", "Для добавления товара необходима авторизация");
      return;
    }
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      notify.warning("Выберите размер", "Пожалуйста, выберите размер перед добавлением");
      return;
    }
    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product!.id, quantity: 1 })).unwrap();
      notify.addedToCart();
    } catch {
      notify.error("Errore", "Не удалось добавить товар");
    } finally {
      setTimeout(() => setAddingToCart(false), 600);
    }
  };

  /** Все фото выбранного цвета (или дефолтное фото) */
  const gallery: string[] = selectedColor?.images?.length
    ? selectedColor.images
    : product?.image ? [product.image] : [];

  const stockInfo = () => {
    if (!product) return null;
    const s = product.stock ?? 0;
    if (s === 0)   return { label: "Нет в наличии",       color: "#FF0000" };
    if (s <= 3)    return { label: `Осталось ${s} шт`,    color: "#CC8800" };
    if (s <= 10)   return { label: `${s} шт в наличии`,   color: "#008000" };
    return           { label: "В наличии",                color: "#008000" };
  };

  if (!product) return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "60vh", gap: 16 }}>
      <div className="loader-ring" />
      <p className="serif" style={{ color: "#8B0000", fontSize: 14, letterSpacing: 3 }}>Caricamento...</p>
    </div>
  );

  const stock = stockInfo();

  return (
    <div style={{ backgroundColor: "#F7F4EF", minHeight: "100vh", padding: "48px 24px" }}>
      <div className="animate-slideInUp" style={{ maxWidth: 1100, margin: "0 auto", backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", display: "flex", flexWrap: "wrap" }}>

        {/* ═══ ЛЕВАЯ ЧАСТЬ: галерея ═══ */}
        <div style={{ flex: "1 1 420px", display: "flex" }}>

          {/* Тумбы (вертикальные) */}
          {gallery.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 0 16px 16px", flexShrink: 0 }}>
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => switchImage(img)}
                  style={{
                    width: 72, height: 72, padding: 0,
                    border: activeImage === img ? "2px solid #FF0000" : "1px solid #D9CFC0",
                    cursor: "pointer", background: "#FAFAFA", overflow: "hidden",
                    transform: activeImage === img ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.22s", flexShrink: 0
                  }}
                >
                  <img
                    src={img} alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Главное фото */}
          <div style={{ flex: 1, position: "relative", height: IMG_H, overflow: "hidden" }}>
            {product.category && (
              <div style={{
                position: "absolute", top: 16, left: 0, zIndex: 2,
                backgroundColor: "#008000", color: "#fff",
                padding: "5px 16px", fontSize: 9, letterSpacing: 3,
                textTransform: "uppercase", fontFamily: "Montserrat", fontWeight: 600
              }}>
                {product.category}
              </div>
            )}
            <img
              src={activeImage || "https://placehold.co/600x520/F7F4EF/8B0000?text=DORRO"}
              alt={product.name}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", display: "block",
                opacity: imgFading ? 0 : 1,
                transform: imgFading ? "scale(1.02)" : "scale(1)",
                transition: "opacity 0.18s ease, transform 0.18s ease"
              }}
            />
          </div>
        </div>

        {/* ═══ ПРАВАЯ ЧАСТЬ: детали ═══ */}
        <div style={{ flex: "1 1 340px", padding: "44px 44px", display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {product.category && (
            <p className="animate-fadeInDelay1" style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 10 }}>
              {product.category}
            </p>
          )}

          <h1 className="serif animate-fadeInDelay1" style={{ fontSize: 30, color: "#1A1A1A", fontWeight: 500, marginBottom: 16, lineHeight: 1.3 }}>
            {product.name}
          </h1>

          <div className="animate-fadeInDelay2" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 28, height: 1, backgroundColor: "#008000" }} />
            <div style={{ width: 5, height: 5, backgroundColor: "#FF0000", borderRadius: "50%" }} />
            <div style={{ width: 28, height: 1, backgroundColor: "#FF0000" }} />
          </div>

          <p className="serif animate-fadeInDelay2" style={{ fontSize: 36, color: "#FF0000", fontWeight: 600, marginBottom: 14 }}>
            {product.price.toLocaleString()} ₽
          </p>

          {/* Статус наличия */}
          {stock && (
            <div className="animate-fadeInDelay2" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div className="stock-pulse" style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: stock.color }} />
              <span style={{ fontSize: 11, fontFamily: "Montserrat", letterSpacing: 1, color: stock.color, fontWeight: 600 }}>
                {stock.label}
              </span>
            </div>
          )}

          {/* ── Цвета ── */}
          {product.colors && product.colors.length > 0 && (
            <div className="animate-fadeInDelay3" style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#777", fontFamily: "Montserrat", marginBottom: 10 }}>
                Цвет: <strong style={{ color: "#1A1A1A", letterSpacing: 0 }}>{selectedColor?.name}</strong>
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {product.colors.map(c => (
                  <button
                    key={c.hex}
                    title={c.name}
                    onClick={() => handleColorSelect(c)}
                    style={{
                      width: 38, height: 38, borderRadius: "50%",
                      backgroundColor: c.hex, cursor: "pointer",
                      border: selectedColor?.hex === c.hex ? "3px solid #1A1A1A" : "2px solid #D9CFC0",
                      boxShadow: selectedColor?.hex === c.hex ? "0 0 0 3px #fff inset" : "none",
                      transform: selectedColor?.hex === c.hex ? "scale(1.18)" : "scale(1)",
                      transition: "all 0.22s"
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Размеры ── */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="animate-fadeInDelay3" style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#777", fontFamily: "Montserrat", marginBottom: 10 }}>
                Размер: <strong style={{ color: "#1A1A1A", letterSpacing: 0 }}>{selectedSize || "—"}</strong>
              </p>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      minWidth: 46, height: 44, padding: "0 10px",
                      border: selectedSize === s ? "2px solid #1A1A1A" : "1px solid #D9CFC0",
                      backgroundColor: selectedSize === s ? "#1A1A1A" : "#fff",
                      color: selectedSize === s ? "#fff" : "#1A1A1A",
                      fontFamily: "Montserrat", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.2s",
                      transform: selectedSize === s ? "scale(1.08)" : "scale(1)"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Описание ── */}
          {product.description && (
            <p className="animate-fadeInDelay3" style={{
              fontSize: 13, color: "#666", lineHeight: 1.85,
              fontFamily: "Montserrat", marginBottom: 28,
              borderLeft: "3px solid #F0ECE4", paddingLeft: 14
            }}>
              {product.description}
            </p>
          )}

          {/* ── Кнопка ── */}
          <button
            onClick={handleAdd}
            disabled={addingToCart || product.stock === 0}
            className={`btn-primary animate-fadeInDelay4${addingToCart ? " btn-loading" : ""}`}
            style={{ width: "100%", textAlign: "center", fontSize: 11, opacity: product.stock === 0 ? 0.5 : 1 }}
          >
            {addingToCart ? "Добавляем..." : product.stock === 0 ? "Нет в наличии" : "Добавить в корзину"}
          </button>

          {/* ── Гарантии ── */}
          <div className="animate-fadeInDelay4" style={{
            display: "flex", gap: 16, marginTop: 22,
            paddingTop: 22, borderTop: "1px solid #F0ECE4", flexWrap: "wrap"
          }}>
            {[["🚚", "Бесплатная доставка"], ["✓", "Гарантия качества"], ["↩", "Возврат 30 дней"]].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "#999", fontFamily: "Montserrat" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
