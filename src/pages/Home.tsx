import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";
import type { AppDispatch } from "../app/store";

// Тип Product объявляем прямо здесь
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  createdAt: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3001/products");
        let filtered: Product[] = response.data;

        if (minPrice !== undefined) {
          filtered = filtered.filter(p => p.price >= minPrice);
        }
        if (maxPrice !== undefined) {
          filtered = filtered.filter(p => p.price <= maxPrice);
        }
        if (search.trim() !== "") {
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
          );
        }

        setProducts(filtered);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, [minPrice, maxPrice, search]);

  const dispatch = useDispatch<AppDispatch>();
  const handleAdd = (id: number) => {
    dispatch(addToCart({ productId: id, quantity: 1 }));
  };

  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">Products</h1>

      <div className="mb-4">
        <input
          type="number"
          placeholder="Min price"
          value={minPrice ?? ""}
          onChange={e => setMinPrice(e.target.value ? +e.target.value : undefined)}
          className="mr-2 p-1 border"
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice ?? ""}
          onChange={e => setMaxPrice(e.target.value ? +e.target.value : undefined)}
          className="mr-2 p-1 border"
        />
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-1 border"
        />
      </div>

      <div className="gap-4 grid grid-cols-3">
        {products.map(product => (
          <Link key={product.id} to={`/product/${product.id}`} className="p-2 border">
            <img src={product.image} alt={product.name} className="mb-2 w-full h-40 object-cover"/>
            <h2 className="font-bold">{product.name}</h2>
            <p>${product.price}</p>
             <button onClick={() => handleAdd(1)}>Добавить товар 1</button>
          </Link>
          
        ))}
      </div>
    </div>
  );
}
