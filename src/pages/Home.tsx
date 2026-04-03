import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../utils/swal";
import type { AppDispatch, RootState } from "../app/store";
import { addToCart } from "../features/cart/cartSlice";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/products`)
      .then((res) => { setProducts(res.data); setFiltered(res.data); })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    let result = products;
    if (search.trim()) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (category) result = result.filter(p => p.category === category);
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
    setFiltered(result);
  }, [search, category, minPrice, maxPrice, products]);

  const handleAdd = async (productId: number) => {
    if (!token) {
      notify.warning('Войдите в аккаунт', 'Для добавления товара необходима авторизация');
      return;
    }
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      notify.addedToCart();
    } catch {
      notify.error('Errore', 'Не удалось добавить товар');
    }
  };

  return (
    <div style={{ backgroundColor: '#F7F4EF', minHeight: '100vh', padding: '60px 40px' }}>

      {/* Заголовок */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: '#008000', fontFamily: 'Montserrat', fontWeight: 600, marginBottom: 12 }}>
          Collezione Primavera
        </p>
        <h1 className="serif" style={{ fontSize: 42, color: '#8B0000', letterSpacing: 4, fontWeight: 500, marginBottom: 16 }}>
          Наша Коллекция
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{ width: 40, height: 1, backgroundColor: '#008000' }} />
          <div style={{ width: 6, height: 6, backgroundColor: '#FF0000', borderRadius: '50%' }} />
          <div style={{ width: 40, height: 1, backgroundColor: '#FF0000' }} />
        </div>
        <p style={{ fontSize: 12, letterSpacing: 2, color: '#888', fontFamily: 'Montserrat' }}>
          Итальянское качество · Спортивный стиль
        </p>
      </div>

      {/* Фильтры */}
      <div style={{
        backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0',
        padding: '28px 36px', marginBottom: 48, maxWidth: 1100, margin: '0 auto 48px'
      }}>
        <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#888', marginBottom: 20, fontFamily: 'Montserrat' }}>
          Фильтры
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 2, minWidth: 200 }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ flex: 1, minWidth: 160 }}>
            <option value="">Все категории</option>
            <option value="Кроссовки">Кроссовки</option>
            <option value="Футболки">Футболки</option>
            <option value="Шорты">Шорты</option>
          </select>
          <input type="number" placeholder="Цена от" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
          <input type="number" placeholder="Цена до" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        </div>
      </div>

      {/* Сетка товаров */}
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 28 }}>
        {filtered.map(product => (
          <div key={product.id} className="italian-card animate-fadeIn" style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              {/* Фото */}
              <div style={{ position: 'relative', overflow: 'hidden', height: 260 }}>
                <img
                  src={product.image || "https://via.placeholder.com/400x300?text=DORRO"}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                  onMouseLeave={e => (e.target as HTMLElement).style.transform = 'scale(1)'}
                />
                {product.category && (
                  <div style={{
                    position: 'absolute', top: 12, left: 0,
                    backgroundColor: '#008000', color: '#FFFFFF',
                    padding: '4px 14px', fontSize: 9, letterSpacing: 3,
                    textTransform: 'uppercase', fontFamily: 'Montserrat', fontWeight: 600
                  }}>
                    {product.category}
                  </div>
                )}
              </div>

              {/* Инфо */}
              <div style={{ padding: '20px 20px 12px' }}>
                <h3 className="serif" style={{ fontSize: 16, color: '#1A1A1A', marginBottom: 8, fontWeight: 500 }}>
                  {product.name}
                </h3>
                <p style={{ fontSize: 11, color: '#888', lineHeight: 1.6, marginBottom: 12, fontFamily: 'Montserrat' }}>
                  {product.description?.slice(0, 70)}{product.description?.length > 70 ? '...' : ''}
                </p>
                <p className="serif" style={{ fontSize: 20, color: '#FF0000', fontWeight: 600 }}>
                  {product.price.toLocaleString()} ₽
                </p>
              </div>
            </Link>

            {/* Кнопка */}
            <div style={{ padding: '0 20px 20px', marginTop: 'auto' }}>
              <button
                onClick={() => handleAdd(product.id)}
                className="btn-primary"
                style={{ width: '100%', textAlign: 'center' }}
              >
                В корзину
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p className="serif" style={{ fontSize: 24, color: '#8B0000', marginBottom: 8 }}>Товары не найдены</p>
          <p style={{ fontSize: 11, letterSpacing: 2, color: '#888', fontFamily: 'Montserrat' }}>Попробуйте изменить фильтры</p>
        </div>
      )}
    </div>
  );
}
