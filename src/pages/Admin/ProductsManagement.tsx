import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

interface Product { id: number; name: string; price: number; description: string; image?: string; category: string; }

const ProductsManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/admin/products`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setProducts(await r.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const resetForm = () => { setEditingId(null); setName(""); setPrice(""); setDescription(""); setImageUrl(""); setCategory(""); };
  const startEditing = (p: Product) => { setEditingId(p.id); setName(p.name); setPrice(String(p.price)); setDescription(p.description); setImageUrl(p.image || ""); setCategory(p.category); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { name, price: Number(price), description, image: imageUrl, category };
    try {
      let r: Response;
      if (editingId) {
        r = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/${editingId}`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        r = await fetch(`${import.meta.env.VITE_API_URL}/admin/products`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
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

  if (loading) return <p className="serif" style={{ color: '#8B0000', textAlign: 'center', padding: 40, letterSpacing: 2 }}>Caricamento...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
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

      {message && (
        <div style={{ backgroundColor: '#008000', color: '#FFFFFF', padding: '12px 20px', marginBottom: 20, fontSize: 11, letterSpacing: 2, fontFamily: 'Montserrat' }}>
          {message}
        </div>
      )}

      {/* Форма */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="animate-scaleUp" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', padding: '40px', width: '100%', maxWidth: 500 }}>
            <h3 className="serif" style={{ fontSize: 20, color: '#8B0000', letterSpacing: 2, marginBottom: 24, textAlign: 'center' }}>
              {editingId ? "Редактировать" : "Добавить товар"}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input placeholder="Название" value={name} onChange={e => setName(e.target.value)} required />
              <input type="number" placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} required />
              <textarea placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical', minHeight: 80 }} />
              <input placeholder="URL изображения" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Выберите категорию</option>
                <option value="Футболки">Футболки</option>
                <option value="Кроссовки">Кроссовки</option>
                <option value="Шорты">Шорты</option>
              </select>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-green" style={{ flex: 1, textAlign: 'center' }}>Сохранить</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary" style={{ flex: 1, textAlign: 'center' }}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Таблица */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Montserrat' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '2px solid #D9CFC0' }}>
              {['Фото', 'Название', 'Цена', 'Категория', 'Действия'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #D9CFC0' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F7F4EF'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
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
                <td style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={() => startEditing(p)} style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#008000', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600 }}>Изменить</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#FF0000', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600 }}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsManagement;
