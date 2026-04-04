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

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [addingToCart, setAddingToCart] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then(res => {
        const p: Product = res.data;
        setProduct(p);
        const firstColor = p.colors?.[0] ?? null;
        setSelectedColor(firstColor);
        setActiveImage(firstColor?.images?.[0] || p.image || "");
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleColorSelect = (color: ColorVariant) => {
    setSelectedColor(color);
    setActiveImage(color.images?.[0] || product?.image || "");
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

  const allImages = selectedColor?.images?.length
    ? selectedColor.images
    : product?.image ? [product.image] : [];

  const stockInfo = () => {
    if (!product) return null;
    const s = product.stock ?? 0;
    if (s === 0) return { label: "Нет в наличии", color: "#FF0000" };
    if (s <= 3) return { label: `Осталось ${s} шт`, color: "#CC8800" };
    if (s <= 10) return { label: `${s} шт в наличии`, color: "#008000" };
    return { label: "В наличии", color: "#008000" };
  };

  if (!product) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
      <div className="loader-ring" />
      <p className="serif" style={{ color: "#8B0000", fontSize: 14, letterSpacing: 3 }}>Caricamento...</p>
    </div>
  );

  const stock = stockInfo();

  return (
    <div style={{ backgroundColor: "#F7F4EF", minHeight: "100vh", padding: "60px 40px" }}>
      <div className="animate-slideInUp" style={{ maxWidth: 1100, margin: "0 auto", backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", display: "flex", flexWrap: "wrap" }}>

        {/* LEFT: gallery */}
        <div style={{ flex: "1 1 420px", display: "flex", flexDirection: "row" }}>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "16px 0 16px 16px" }}>
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: 68, height: 68, padding: 3, cursor: "pointer", background: "#fff",
                    border: activeImage === img ? "2px solid #FF0000" : "1px solid #D9CFC0",
                    transform: activeImage === img ? "scale(1.06)" : "scale(1)",
                    transition: "all 0.25s"
                  }}
                >
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}

          {/* Main photo */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 540 }}>
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
              key={activeImage}
              src={activeImage || "https://via.placeholder.com/600x700?text=DORRO"}
              alt={product.name}
              className="animate-imageSwitch"
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s", display: "block" }}
              onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
            />
          </div>
        </div>

        {/* RIGHT: details */}
        <div style={{ flex: "1 1 360px", padding: "52px 48px", display: "flex", flexDirection: "column" }}>

          {product.category && (
            <p className="animate-fadeInDelay1" style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#008000", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 12 }}>
              {product.category}
            </p>
          )}

          <h1 className="serif animate-fadeInDelay1" style={{ fontSize: 34, color: "#1A1A1A", fontWeight: 500, marginBottom: 20, lineHeight: 1.3 }}>
            {product.name}
          </h1>

          <div className="animate-fadeInDelay2" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 28, height: 1, backgroundColor: "#008000" }} />
            <div style={{ width: 5, height: 5, backgroundColor: "#FF0000", borderRadius: "50%" }} />
            <div style={{ width: 28, height: 1, backgroundColor: "#FF0000" }} />
          </div>

          <p className="serif animate-fadeInDelay2" style={{ fontSize: 38, color: "#FF0000", fontWeight: 600, marginBottom: 16 }}>
            {product.price.toLocaleString()} ₽
          </p>

          {stock && (
            <div className="animate-fadeInDelay2" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <div className="stock-pulse" style={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: stock.color }} />
              <span style={{ fontSize: 11, fontFamily: "Montserrat", letterSpacing: 1, color: stock.color, fontWeight: 600 }}>
                {stock.label}
              </span>
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="animate-fadeInDelay3" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#555", fontFamily: "Montserrat", marginBottom: 12 }}>
                Цвет: <strong style={{ color: "#1A1A1A" }}>{selectedColor?.name}</strong>
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {product.colors.map(c => (
                  <button
                    key={c.hex}
                    title={c.name}
                    onClick={() => handleColorSelect(c)}
                    style={{
                      width: 36, height: 36, borderRadius: "50%", backgroundColor: c.hex, cursor: "pointer",
                      border: selectedColor?.hex === c.hex ? "3px solid #1A1A1A" : "2px solid #D9CFC0",
                      outline: selectedColor?.hex === c.hex ? "2px solid #fff" : "none",
                      outlineOffset: "-5px",
                      transform: selectedColor?.hex === c.hex ? "scale(1.2)" : "scale(1)",
                      transition: "all 0.22s"
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="animate-fadeInDelay3" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#555", fontFamily: "Montserrat", marginBottom: 12 }}>
                Размер: <strong style={{ color: "#1A1A1A" }}>{selectedSize || "—"}</strong>
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      minWidth: 46, height: 46, padding: "0 12px",
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

          {product.description && (
            <p className="animate-fadeInDelay3" style={{ fontSize: 13, color: "#666", lineHeight: 1.85, fontFamily: "Montserrat", marginBottom: 32 }}>
              {product.description}
            </p>
          )}

          <button
            onClick={handleAdd}
            disabled={addingToCart || product.stock === 0}
            className={`btn-primary animate-fadeInDelay4${addingToCart ? " btn-loading" : ""}`}
            style={{ width: "100%", textAlign: "center", fontSize: 11, opacity: product.stock === 0 ? 0.6 : 1 }}
          >
            {addingToCart ? "Добавляем..." : product.stock === 0 ? "Нет в наличии" : "Добавить в корзину"}
          </button>

          <div className="animate-fadeInDelay4" style={{ display: "flex", gap: 20, marginTop: 24, paddingTop: 24, borderTop: "1px solid #F0ECE4", flexWrap: "wrap" }}>
            {[["🚚", "Бесплатная доставка"], ["✓", "Гарантия качества"], ["↩", "Возврат 30 дней"]].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#999", fontFamily: "Montserrat" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
