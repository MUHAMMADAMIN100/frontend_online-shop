import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import type { AppDispatch } from '../app/store';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}


export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:3001/products/${id}`)
        .then((res) => {
          setProduct(res.data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (!product) return <p>Продукт не найден</p>;

  return (
    <div className="p-6">
      <h1 className="font-bold text-2xl">{product.name}</h1>
      <p>{product.description}</p>
      <p className="font-semibold text-lg">{product.price} $</p>
      {product.image && (
        <img src={product.image} alt={product.name} className="mt-4 w-64" />
      )}
    </div>
  );
}

