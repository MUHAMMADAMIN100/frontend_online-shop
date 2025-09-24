import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProducts } from '../features/products/productsSlice';
import ProductCard from '../components/ProductCard';
import { addToCart } from '../features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(s => s.products.items);
  const status = useAppSelector(s => s.products.status);
  const auth = useAppSelector(s => s.auth);
  const nav = useNavigate();

  useEffect(() => {
    if (status === 'idle') dispatch(fetchProducts());
  }, [dispatch, status]);

  const handleAdd = (productId: number) => {
    if (!auth.token || !auth.userId) { nav('/login'); return; }
    dispatch(addToCart({ userId: auth.userId!, productId, quantity: 1 }));
  };

  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">Products</h1>
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onAdd={() => handleAdd(p.id)} />
        ))}
      </div>
    </div>
  );
}
