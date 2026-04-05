import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import LoadingLogo from "../../components/LoadingLogo";

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

const ProductsManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

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
      if (r.ok) setProducts(await r.json());
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
    try {
      let r: Response;
      if (editingId) {
        r = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/${editingId}`, {
          method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      } else {
        r = await fetch(`${import.meta.env.VITE_API_URL}/admin/products`, {
          method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
      }
      if (r.ok) {
        const updated = await r.json();
        if (editingId) setProducts(products.map(p => p.id === editingId ? updated : p));
        else setProducts([...products, updated]);
        resetForm(); setShowForm(false);
        setMessage(editingId ? "Товар обновлён" : "Товар добавлен");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (e) { console.error(e); }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setProducts(products.filter(p => p.id !== id));
    } catch (e) { console.error(e); }
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
          <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#008000', fontFamily: 'Montserrat', fontWeight: 600, marginBottom: 4 }}>Gestione Prodotti</p>
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
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
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
          style={{ ...inputStyle, width: 'auto', minWidth: 160, cursor: 'pointer' }}
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
      <div style={{ overflowX: 'auto' }}>
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
                  <span className="serif" style={{ fontSize: 16, color: '#FF0000', fontWeight: 600 }}>{p.price.toLocaleString()} ₽</span>
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20 }}>
          <div className="animate-scaleUp" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', padding: '40px', width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="serif" style={{ fontSize: 20, color: '#8B0000', letterSpacing: 2, marginBottom: 24, textAlign: 'center' }}>
              {editingId ? "Редактировать товар" : "Добавить товар"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Название" value={name} onChange={e => setName(e.target.value)} required style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />

              <div style={{ display: 'flex', gap: 12 }}>
                <input type="number" placeholder="Цена (₽)" value={price} onChange={e => setPrice(e.target.value)} required style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                <input type="number" placeholder="Остаток (шт)" value={stock} onChange={e => setStock(e.target.value)} min={0} style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
              </div>

              <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />

              <input placeholder="URL главного изображения" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />

              <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Выберите категорию</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <input placeholder="Размеры (через запятую: XS, S, M или 36, 37, 38)" value={sizes} onChange={e => setSizes(e.target.value)} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />

              {/* Цвета */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', fontFamily: 'Montserrat', fontWeight: 600 }}>Цвета и фото</span>
                  <button type="button" onClick={addColor}
                    style={{ border: '1px solid #008000', color: '#008000', padding: '5px 14px', fontFamily: 'Montserrat', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', background: 'transparent' }}>
                    + Добавить цвет
                  </button>
                </div>
                {colors.map((color, ci) => (
                  <div key={ci} style={{ border: '1px solid #D9CFC0', padding: 16, marginBottom: 10, backgroundColor: '#FAFAF8' }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end' }}>
                      <input value={color.name} onChange={e => updateColor(ci, 'name', e.target.value)}
                        placeholder="Название цвета" style={{ ...inputStyle, flex: 1 }}
                        onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                      <input type="color" value={color.hex} onChange={e => updateColor(ci, 'hex', e.target.value)}
                        style={{ width: 40, height: 38, padding: 2, border: '1px solid #D9CFC0', cursor: 'pointer' }} />
                      <input value={color.hex} onChange={e => updateColor(ci, 'hex', e.target.value)}
                        style={{ ...inputStyle, width: 90 }} placeholder="#FF0000"
                        onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                      <button type="button" onClick={() => removeColor(ci)}
                        style={{ border: 'none', background: 'none', color: '#FF0000', cursor: 'pointer', padding: '0 4px' }}>
                        <TrashIcon />
                      </button>
                    </div>
                    {color.images.map((img, ii) => (
                      <div key={ii} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                        <input value={img} onChange={e => updateColorImage(ci, ii, e.target.value)}
                          placeholder="URL фотографии" style={{ ...inputStyle, flex: 1 }}
                          onFocus={e => (e.target.style.borderColor = '#8B0000')} onBlur={e => (e.target.style.borderColor = '#D9CFC0')} />
                        {img && <img src={img} alt="" style={{ width: 38, height: 38, objectFit: 'cover', border: '1px solid #D9CFC0' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />}
                        {color.images.length > 1 && (
                          <button type="button" onClick={() => removeColorImage(ci, ii)} style={{ border: 'none', background: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addColorImage(ci)} style={{ fontSize: 10, letterSpacing: 1, color: '#888', fontFamily: 'Montserrat', background: 'none', border: 'none', cursor: 'pointer' }}>+ ещё фото</button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-green" style={{ flex: 1, textAlign: 'center' }}>Сохранить</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
