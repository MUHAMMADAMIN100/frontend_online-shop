import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import type { AppDispatch, RootState } from "../app/store";
import { addToCart } from "../features/cart/cartSlice";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleAdd = async () => {
    if (!token) {
      Swal.fire({ icon: 'warning', title: 'Войдите в аккаунт', text: 'Необходима авторизация', confirmButtonColor: '#FF0000' });
      return;
    }
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
      Swal.fire({ icon: 'success', title: 'Aggiunto al carrello!', timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Errore', text: 'Не удалось добавить товар', confirmButtonColor: '#FF0000' });
    }
  };

  if (!product) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p className="serif" style={{ color: '#8B0000', fontSize: 18, letterSpacing: 3 }}>Caricamento...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F7F4EF', minHeight: '100vh', padding: '60px 40px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', backgroundColor: '#FFFFFF', border: '1px solid #D9CFC0', display: 'flex', flexWrap: 'wrap' }}>

        {/* Фото */}
        <div style={{ flex: '1 1 400px', overflow: 'hidden', maxHeight: 540 }}>
          <img
            src={product.image || "https://via.placeholder.com/600x540?text=OLIMPIA"}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s' }}
            onMouseEnter={e => (e.target as HTMLElement).style.transform = 'scale(1.04)'}
            onMouseLeave={e => (e.target as HTMLElement).style.transform = 'scale(1)'}
          />
        </div>

        {/* Детали */}
        <div style={{ flex: '1 1 360px', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {product.category && (
            <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#008000', fontFamily: 'Montserrat', fontWeight: 600, marginBottom: 16 }}>
              {product.category}
            </p>
          )}
          <h1 className="serif" style={{ fontSize: 32, color: '#1A1A1A', fontWeight: 500, marginBottom: 16, lineHeight: 1.3 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 24, height: 1, backgroundColor: '#008000' }} />
            <div style={{ width: 4, height: 4, backgroundColor: '#FF0000', borderRadius: '50%' }} />
            <div style={{ width: 24, height: 1, backgroundColor: '#FF0000' }} />
          </div>

          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.8, fontFamily: 'Montserrat', marginBottom: 32 }}>
            {product.description}
          </p>

          <p className="serif" style={{ fontSize: 36, color: '#FF0000', fontWeight: 600, marginBottom: 32 }}>
            {product.price.toLocaleString()} ₽
          </p>

          <button onClick={handleAdd} className="btn-primary" style={{ width: '100%', textAlign: 'center', fontSize: 11 }}>
            Добавить в корзину
          </button>

          <p style={{ marginTop: 20, fontSize: 9, letterSpacing: 3, color: '#999', fontFamily: 'Montserrat', textAlign: 'center', textTransform: 'uppercase' }}>
            Доставка · Гарантия качества · Возврат 30 дней
          </p>
        </div>
      </div>
    </div>
  );
}
