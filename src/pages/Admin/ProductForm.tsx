import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSave, FiPlus, FiTrash2 } from "react-icons/fi";
import type { IconType } from "react-icons";

interface ColorVariant {
  name: string;
  hex: string;
  images: string[];
}

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes: string;
  stock: number;
  colors: ColorVariant[];
}

const Icon: React.FC<{ icon: IconType; size?: number }> = ({ icon: IconComponent, size }) => (
  <IconComponent size={size} />
);

const labelStyle: React.CSSProperties = {
  display: "block", marginBottom: 6,
  fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
  color: "#555", fontFamily: "Montserrat", fontWeight: 600
};

const fieldStyle: React.CSSProperties = {
  border: "1px solid #D9CFC0", padding: "10px 14px", width: "100%",
  fontFamily: "Montserrat", fontSize: 13, background: "#FFFFFF",
  outline: "none", transition: "border-color 0.2s"
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product>({
    name: "", description: "", price: 0, image: "",
    category: "", sizes: "", stock: 0, colors: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`)
        .then(res => {
          const d = res.data;
          setProduct({
            ...d,
            sizes: Array.isArray(d.sizes) ? d.sizes.join(", ") : (d.sizes || ""),
            colors: Array.isArray(d.colors) ? d.colors : [],
            stock: d.stock ?? 0
          });
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: name === "price" || name === "stock" ? Number(value) : value }));
  };

  // Color helpers
  const addColor = () => setProduct(prev => ({
    ...prev,
    colors: [...prev.colors, { name: "", hex: "#000000", images: [""] }]
  }));

  const removeColor = (i: number) => setProduct(prev => ({
    ...prev,
    colors: prev.colors.filter((_, idx) => idx !== i)
  }));

  const updateColor = (i: number, field: keyof ColorVariant, value: any) => setProduct(prev => {
    const colors = [...prev.colors];
    colors[i] = { ...colors[i], [field]: value };
    return { ...prev, colors };
  });

  const addColorImage = (ci: number) => setProduct(prev => {
    const colors = [...prev.colors];
    colors[ci] = { ...colors[ci], images: [...colors[ci].images, ""] };
    return { ...prev, colors };
  });

  const updateColorImage = (ci: number, ii: number, val: string) => setProduct(prev => {
    const colors = [...prev.colors];
    const images = [...colors[ci].images];
    images[ii] = val;
    colors[ci] = { ...colors[ci], images };
    return { ...prev, colors };
  });

  const removeColorImage = (ci: number, ii: number) => setProduct(prev => {
    const colors = [...prev.colors];
    colors[ci] = { ...colors[ci], images: colors[ci].images.filter((_, idx) => idx !== ii) };
    return { ...prev, colors };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Нет токена");

      const payload = {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        sizes: product.sizes
          ? product.sizes.split(",").map(s => s.trim()).filter(Boolean)
          : [],
        colors: product.colors.map(c => ({
          ...c,
          images: c.images.filter(img => img.trim())
        }))
      };

      if (id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/products/${id}`, payload,
          { headers: { Authorization: `Bearer ${token}` } });
        setMessage("Товар обновлён!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/products`, payload,
          { headers: { Authorization: `Bearer ${token}` } });
        setMessage("Товар создан!");
      }

      setTimeout(() => navigate("/admin/products"), 1200);
    } catch (err) {
      console.error(err);
      setMessage("Ошибка при сохранении");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D9CFC0", maxWidth: 760, margin: "24px auto", padding: "40px 48px" }}>

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 className="serif" style={{ fontSize: 26, color: "#8B0000", letterSpacing: 3, fontWeight: 500 }}>
          {id ? "Редактирование товара" : "Создание товара"}
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
          <div style={{ width: 20, height: 1, backgroundColor: "#008000" }} />
          <div style={{ width: 4, height: 4, backgroundColor: "#FF0000", borderRadius: "50%" }} />
          <div style={{ width: 20, height: 1, backgroundColor: "#FF0000" }} />
        </div>
      </div>

      {message && (
        <div className="animate-fadeIn" style={{ backgroundColor: "#F0FFF0", border: "1px solid #008000", padding: "12px 20px", marginBottom: 24, textAlign: "center", fontFamily: "Montserrat", fontSize: 12, color: "#005500", letterSpacing: 1 }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Basic fields */}
        {[
          { label: "Название", name: "name", type: "text", required: true },
          { label: "URL главного изображения", name: "image", type: "text" },
          { label: "Категория", name: "category", type: "text" },
        ].map(f => (
          <div key={f.name}>
            <label style={labelStyle}>{f.label}</label>
            <input name={f.name} type={f.type} value={(product as any)[f.name]} onChange={handleChange}
              required={f.required} style={fieldStyle}
              onFocus={e => (e.target.style.borderColor = "#FF0000")}
              onBlur={e => (e.target.style.borderColor = "#D9CFC0")}
            />
          </div>
        ))}

        <div>
          <label style={labelStyle}>Описание</label>
          <textarea name="description" value={product.description} onChange={handleChange}
            rows={3} style={{ ...fieldStyle, resize: "vertical" }}
            onFocus={e => (e.target.style.borderColor = "#FF0000")}
            onBlur={e => (e.target.style.borderColor = "#D9CFC0")}
          />
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Цена ($)</label>
            <input name="price" type="number" value={product.price} onChange={handleChange} required style={fieldStyle}
              onFocus={e => (e.target.style.borderColor = "#FF0000")}
              onBlur={e => (e.target.style.borderColor = "#D9CFC0")}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Остаток на складе</label>
            <input name="stock" type="number" min={0} value={product.stock} onChange={handleChange} style={fieldStyle}
              onFocus={e => (e.target.style.borderColor = "#FF0000")}
              onBlur={e => (e.target.style.borderColor = "#D9CFC0")}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Размеры (через запятую, напр: XS, S, M, L, XL)</label>
          <input name="sizes" type="text" value={product.sizes} onChange={handleChange}
            placeholder="XS, S, M, L, XL или 36, 37, 38, 39, 40" style={fieldStyle}
            onFocus={e => (e.target.style.borderColor = "#FF0000")}
            onBlur={e => (e.target.style.borderColor = "#D9CFC0")}
          />
        </div>

        {/* Colors */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <label style={labelStyle}>Цвета и фотографии</label>
            <button type="button" onClick={addColor} style={{
              display: "flex", alignItems: "center", gap: 6,
              border: "1px solid #008000", color: "#008000",
              padding: "6px 16px", fontFamily: "Montserrat", fontSize: 10,
              letterSpacing: 2, textTransform: "uppercase", cursor: "pointer",
              background: "transparent", transition: "all 0.2s"
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#008000"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#008000"; }}
            >
              <Icon icon={FiPlus} size={14} /> Добавить цвет
            </button>
          </div>

          {product.colors.map((color, ci) => (
            <div key={ci} className="animate-fadeIn" style={{ border: "1px solid #D9CFC0", padding: "20px", marginBottom: 12, backgroundColor: "#FAFAF8" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>Название цвета</label>
                  <input value={color.name} onChange={e => updateColor(ci, "name", e.target.value)}
                    placeholder="Красный, Белый..." style={{ ...fieldStyle, backgroundColor: "#fff" }}
                    onFocus={e => (e.target.style.borderColor = "#FF0000")}
                    onBlur={e => (e.target.style.borderColor = "#D9CFC0")}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 4 }}>HEX</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="color" value={color.hex} onChange={e => updateColor(ci, "hex", e.target.value)}
                      style={{ width: 46, height: 42, padding: 2, border: "1px solid #D9CFC0", cursor: "pointer", background: "#fff" }}
                    />
                    <input value={color.hex} onChange={e => updateColor(ci, "hex", e.target.value)}
                      style={{ ...fieldStyle, width: 100, backgroundColor: "#fff" }} placeholder="#FF0000"
                      onFocus={e => (e.target.style.borderColor = "#FF0000")}
                      onBlur={e => (e.target.style.borderColor = "#D9CFC0")}
                    />
                  </div>
                </div>
                <button type="button" onClick={() => removeColor(ci)}
                  style={{ border: "none", backgroundColor: "transparent", color: "#FF0000", cursor: "pointer", padding: "10px 6px" }}
                >
                  <Icon icon={FiTrash2} size={18} />
                </button>
              </div>

              {/* Images for this color */}
              <div>
                <label style={{ ...labelStyle, marginBottom: 8 }}>Фотографии этого цвета</label>
                {color.images.map((img, ii) => (
                  <div key={ii} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                    <input value={img} onChange={e => updateColorImage(ci, ii, e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      style={{ ...fieldStyle, flex: 1, backgroundColor: "#fff" }}
                      onFocus={e => (e.target.style.borderColor = "#FF0000")}
                      onBlur={e => (e.target.style.borderColor = "#D9CFC0")}
                    />
                    {img && (
                      <img src={img} alt="" style={{ width: 40, height: 40, objectFit: "cover", border: "1px solid #D9CFC0", flexShrink: 0 }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    {color.images.length > 1 && (
                      <button type="button" onClick={() => removeColorImage(ci, ii)}
                        style={{ border: "none", backgroundColor: "transparent", color: "#888", cursor: "pointer" }}
                      >
                        <Icon icon={FiTrash2} size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addColorImage(ci)} style={{
                  fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
                  color: "#888", fontFamily: "Montserrat", background: "none",
                  border: "none", cursor: "pointer", padding: "4px 0", marginTop: 4
                }}>
                  + ещё фото
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 40px" }}>
            <Icon icon={FiSave} size={16} />
            {loading ? "Сохранение..." : "Сохранить товар"}
          </button>
        </div>
      </form>
    </div>
  );
}
