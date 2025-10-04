import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
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
      .get("http://localhost:3001/products")
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);
      })
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
      Swal.fire({
        icon: 'warning',
        title: 'Войдите в аккаунт',
        text: 'Чтобы добавить товар в корзину, необходимо авторизоваться',
      });
      return;
    }
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Товар добавлен!',
        text: 'Товар успешно добавлен в корзину',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Ошибка',
        text: 'Не удалось добавить товар в корзину',
      });
    }
  };

  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <h2 className="mb-6 font-bold text-blue-700 text-3xl text-center animate-fadeIn">🏋️ Спортивный магазин</h2>

      <div className="flex md:flex-row flex-col items-center gap-4 bg-white shadow-md mb-6 p-4 rounded-xl hover:scale-[1.01] transition-transform">
        <input 
          type="text" 
          placeholder="Поиск по имени..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="flex-1 p-2 border rounded-lg focus:outline-blue-500"
        />
        <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-lg cursor-pointer">
          <option value="">Все категории</option>
          <option value="Кроссовки">Кроссовки</option>
          <option value="Футболки">Одежда</option>
          <option value="Шорты">Шорты</option>
        </select>
        <input type="number" placeholder="Цена от" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="p-2 border rounded-lg w-28"/>
        <input type="number" placeholder="Цена до" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="p-2 border rounded-lg w-28"/>
      </div>

      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(product => (
          <div 
            key={product.id} 
            className="flex flex-col justify-between bg-white shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden hover:scale-105 transition transform"
          >
            <Link to={`/product/${product.id}`} className="group relative">
              <div className="h-56 sm:h-64 md:h-56 lg:h-64 overflow-hidden">
                <img 
                  src={product.image || "https://via.placeholder.com/300"} 
                  alt={product.name} 
                  className="w-full h-100% object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-blue-800 text-xl">{product.name}</h3>
                <p className="mt-1 text-gray-600">{product.description}</p>
                <p className="mt-2 font-extrabold text-green-600 text-2xl">{product.price} ₽</p>
              </div>
            </Link>
            <button 
              onClick={() => handleAdd(product.id)} 
              className="bg-blue-600 hover:bg-blue-800 shadow-lg mx-4 mt-2 mb-4 px-4 py-3 rounded-xl font-bold text-white hover:scale-105 transition-transform cursor-pointer transform"
            >
              🛒 Добавить в корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
