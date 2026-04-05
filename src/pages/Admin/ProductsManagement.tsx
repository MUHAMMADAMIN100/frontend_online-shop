import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import LoadingLogo from "../../components/LoadingLogo";
import { cacheGet, cacheSet, cacheInvalidate } from "../../utils/cache";

interface ColorVariant { name: string; hex: string; images: string[]; }
interface Product {
  id: number; name: string; price: number; description: string;
  image?: string; category: string;
  colors?: ColorVariant[]; sizes?: string[]; stock?: number;
}

const CATEGORIES = ["Футболки", "Кроссовки", "Шорты"];

// SVG-иконки
const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);

const CACHE_KEY = "admin-products";

const ProductsManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>(() => cacheGet<Product[]>(CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => !cacheGet(CACHE_KEY));
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Поля формы
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("0");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState<ColorVariant[]>([]);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const data = await r.json(); setProducts(data); cacheSet(CACHE_KEY, data); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const resetForm = () => {
    setEditingId(null); setName(""); setPrice(""); setDescription("");
    setImageUrl(""); setCategory(""); setStock("0"); setSizes(""); setColors([]);
  };

  const startEditing = (p: Product) => {
    setEditingId(p.id);
    setName(p.name); setPrice(String(p.price)); setDescription(p.description);
    setImageUrl(p.image || ""); setCategory(p.category);
    setStock(String(p.stock ?? 0));
    setSizes(Array.isArray(p.sizes) ? p.sizes.join(", ") : "");
    setColors(Array.isArray(p.colors) ? p.colors : []);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      name, price: Number(price), description, image: imageUrl, category,
      stock: Number(stock),
      sizes: sizes ? sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
      colors: colors.map(c => ({ ...c, images: c.images.filter(img => img.trim()) }))
    };

    if (editingId) {
      // ── Оптимистичное редактирование ──
      const prev = products;
      const optimistic: Product = { ...body, id: editingId };
      setProducts(prev.map(p => p.id === editingId ? optimistic : p));
      resetForm(); setShowForm(false);
      setMessage("Товар обновлён"); setTimeout(() => setMessage(""), 3000);
      cacheInvalidate("products"); // сбрасываем кэш главной страницы

      fetch(`${import.meta.env.VITE_API_URL}/admin/products/${editingId}`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(r => {
        if (r.ok) r.json().then(updated => {
          setProducts(p => p.map(pr => pr.id === editingId ? updated : pr));
          cacheSet(CACHE_KEY, products.map(pr => pr.id === editingId ? updated : pr));
        });
        else { setProducts(prev); setMessage("Ошибка при обновлении"); setTimeout(() => setMessage(""), 3000); }
      }).catch(() => setProducts(prev));

    } else {
      // ── Оптимистичное добавление (временный ID) ──
      const tempId = -Date.now();
      const tempProduct: Product = { ...body, id: tempId };
      setProducts(prev => [...prev, tempProduct]);
      resetForm(); setShowForm(false);
      setMessage("Товар добавлен"); setTimeout(() => setMessage(""), 3000);
      cacheInvalidate("products");

      fetch(`${import.meta.env.VITE_API_URL}/admin/products`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).then(r => {
        if (r.ok) r.json().then(created =>
          setProducts(p => { const updated = p.map(pr => pr.id === tempId ? created : pr); cacheSet(CACHE_KEY, updated); return updated; })
        );
        else setProducts(p => p.filter(pr => pr.id !== tempId)); // откат
      }).catch(() => setProducts(p => p.filter(pr => pr.id !== tempId)));
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    // Мгновенно убираем из списка
    const prev = products;
    setProducts(products.filter(p => p.id !== id));
    cacheInvalidate("products");
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) setProducts(prev); // откат
    } catch { setProducts(prev); }
  };

  // Color helpers
  const addColor = () => setColors(prev => [...prev, { name: "", hex: "#000000", images: [""] }]);
  const removeColor = (i: number) => setColors(prev => prev.filter((_, idx) => idx !== i));
  const updateColor = (i: number, field: keyof ColorVariant, value: any) =>
    setColors(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  const addColorImage = (ci: number) =>
    setColors(prev => prev.map((c, idx) => idx === ci ? { ...c, images: [...c.images, ""] } : c));
  const updateColorImage = (ci: number, ii: number, val: string) =>
    setColors(prev => prev.map((c, cIdx) => cIdx !== ci ? c : { ...c, images: c.images.map((img, iIdx) => iIdx === ii ? val : img) }));
  const removeColorImage = (ci: number, ii: number) =>
    setColors(prev => prev.map((c, cIdx) => cIdx !== ci ? c : { ...c, images: c.images.filter((_, iIdx) => iIdx !== ii) }));

  // Фильтрация
  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && p.category !== filterCategory) return false;
    return true;
  });

  const inputStyle: React.CSSProperties = {
    border: "1px solid #D9CFC0", padding: "9px 12px", width: "100%",
    fontFamily: "Montserrat", fontSize: 13, outline: "none"
  };

  if (loading) return <LoadingLogo height="300px" size={64} />;

  return (
    <div>
      {/* Заголовок */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#008000', fontFamily: 'Montserrat', fontWeight: 600, marginBottom: 4 }}>Управление товарами</p>
          <h2 className="serif" style={{ fontSize: 24, color: '#8B0000', fontWeight: 500 }}>Товары</h2>
          <div style={{ width: 40, height: 2, backgroundColor: '#FF0000', marginTop: 8 }} />
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">
            + Добавить товар
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ position: 'relative', flex: '1 1 160px', minWidth: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className="admin-search-input"
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
            onFocus={e => (e.target.style.borderColor = '#8B0000')}
            onBlur={e => (e.target.style.borderColor = '#D9CFC0')}
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{ ...inputStyle, flex: '0 1 160px', minWidth: 120, cursor: 'pointer' }}
        >
          <option value="">Все категории</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || filterCategory) && (
          <button onClick={() => { setSearch(""); setFilterCategory(""); }}
            style={{ border: '1px solid #D9CFC0', background: 'none', padding: '9px 14px', cursor: 'pointer', fontSize: 11, color: '#888', fontFamily: 'Montserrat', letterSpacing: 1 }}>
            Сбросить
          </button>
        )}
      </div>
      <p style={{ fontSize: 10, color: '#888', fontFamily: 'Montserrat', letterSpacing: 1, marginBottom: 16 }}>
        Найдено: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> из {products.length}
      </p>

      {message && (
        <div style={{ backgroundColor: '#008000', color: '#FFFFFF', padding: '12px 20px', marginBottom: 20, fontSize: 11, letterSpacing: 2, fontFamily: 'Montserrat' }}>
          {message}
        </div>
      )}

      {/* Таблица */}
      <div className="table-scroll scroll-x-touch">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Montserrat' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '2px solid #D9CFC0' }}>
              {['Фото', 'Название', 'Цена', 'Категория', 'Склад', 'Цвета', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #D9CFC0' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F7F4EF'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                <td style={{ padding: '12px 16px' }}>
                  {p.image ? <img src={p.image} alt={p.name} style={{ width: 52, height: 52, objectFit: 'cover' }} /> : <div style={{ width: 52, height: 52, backgroundColor: '#F7F4EF', border: '1px solid #D9CFC0' }} />}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <p className="serif" style={{ fontSize: 15, color: '#1A1A1A', fontWeight: 500, marginBottom: 2 }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: '#888', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</p>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className="serif" style={{ fontSize: 16, color: '#008000', fontWeight: 600 }}>{p.price.toLocaleString()} $</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', backgroundColor: '#008000', color: '#FFFFFF', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>{p.category}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 13, color: (p.stock ?? 0) <= 5 ? '#CC8800' : '#1A1A1A', fontWeight: 600 }}>{p.stock ?? 0}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(p.colors || []).slice(0, 4).map(c => (
                      <div key={c.hex} style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: c.hex, border: '1px solid #D9CFC0' }} title={c.name} />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => startEditing(p)}
                      title="Изменить"
                      style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #008000', color: '#008000', background: 'none', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#008000'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#008000'; }}>
                      <EditIcon />
                    </button>
                    <button onClick={() => deleteProduct(p.id)}
                      title="Удалить"
                      style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #FF0000', color: '#FF0000', background: 'none', cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FF0000'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#FF0000'; }}>
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#888', fontFamily: 'Montserrat', fontSize: 12 }}>Товары не найдены</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div className="animate-scaleUp" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', width: '100%', maxWidth: 680, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

            {/* Шапка — фиксированная */}
            <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #D9CFC0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 className="serif" style={{ fontSize: 18, color: '#8B0000', letterSpacing: 2, margin: 0 }}>
                {editingId ? "Редактировать товар" : "Добавить товар"}
              </h3>
              <button onClick={() => { setShowForm(false); resetForm(); }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#888', padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Тело формы — прокручиваемое */}
            <form ref={formRef} onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Название */}
              <input placeholder="Название товара" value={name} onChange={e => setName(e.target.value)} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />

              {/* Цена + Склад + Категория в ряд */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <input type="number" placeholder="Цена ($)" value={price} onChange={e => setPrice(e.target.value)} required style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                <input type="number" placeholder="Остаток" value={stock} onChange={e => setStock(e.target.value)} min={0} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Категория</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* URL фото + Размеры в ряд */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input placeholder="URL главного фото" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                <input placeholder="Размеры: XS, S, M или 36, 37" value={sizes} onChange={e => setSizes(e.target.value)} style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
              </div>

              {/* Описание — компактное */}
              <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)}
                style={{ ...inputStyle, resize: 'none', height: 60 }}
                onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />

              {/* Цвета */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', fontFamily: 'Montserrat', fontWeight: 600 }}>Цвета и фото</span>
                  <button type="button" onClick={addColor}
                    style={{ border: '1px solid #008000', color: '#008000', padding: '4px 12px', fontFamily: 'Montserrat', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', background: 'transparent' }}>
                    + Цвет
                  </button>
                </div>
                {colors.map((color, ci) => (
                  <div key={ci} style={{ border: '1px solid #D9CFC0', padding: '10px 12px', marginBottom: 8, backgroundColor: '#FAFAF8' }}>
                    {/* Строка: название + color picker + hex + удалить */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <input value={color.name} onChange={e => updateColor(ci, 'name', e.target.value)}
                        placeholder="Название" style={{ ...inputStyle, flex: 1, padding: '7px 10px', fontSize: 12 }}
                        onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                      <input type="color" value={color.hex} onChange={e => updateColor(ci, 'hex', e.target.value)}
                        style={{ width: 34, height: 34, padding: 2, border: '1px solid #D9CFC0', cursor: 'pointer', flexShrink: 0 }} />
                      <input value={color.hex} onChange={e => updateColor(ci, 'hex', e.target.value)}
                        style={{ ...inputStyle, width: 82, padding: '7px 8px', fontSize: 12 }} placeholder="#000000"
                        onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                      <button type="button" onClick={() => removeColor(ci)}
                        style={{ border: 'none', background: 'none', color: '#FF0000', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                        <TrashIcon />
                      </button>
                    </div>
                    {/* Фотографии */}
                    {color.images.map((img, ii) => (
                      <div key={ii} style={{ display: 'flex', gap: 6, marginBottom: 5, alignItems: 'center' }}>
                        <input value={img} onChange={e => updateColorImage(ci, ii, e.target.value)}
                          placeholder="URL фото" style={{ ...inputStyle, flex: 1, padding: '6px 10px', fontSize: 11 }}
                          onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                        {img && <img src={img} alt="" style={{ width: 32, height: 32, objectFit: 'cover', border: '1px solid #D9CFC0', flexShrink: 0 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
                        {color.images.length > 1 && (
                          <button type="button" onClick={() => removeColorImage(ci, ii)} style={{ border: 'none', background: 'none', color: '#aaa', cursor: 'pointer', padding: 2, flexShrink: 0, fontSize: 14 }}>✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addColorImage(ci)} style={{ fontSize: 10, color: '#888', fontFamily: 'Montserrat', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ фото</button>
                  </div>
                ))}
              </div>
            </form>

            {/* Футер формы — фиксированный */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #D9CFC0', display: 'flex', gap: 10, flexShrink: 0 }}>
              <button type="button" onClick={() => formRef.current?.requestSubmit()} className="btn-green" style={{ flex: 2, textAlign: 'center' }}>Сохранить</button>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
