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
      .get("https://backend-online-shop-vrxj.onrender.com/products")
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
        timer: 1200,
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
    <div className="bg-gradient-to-b from-gray-50 to-gray-200 p-6 min-h-screen">
      <h2 className="drop-shadow-lg mb-10 font-extrabold text-blue-900 text-4xl text-center animate-fadeIn">
        🏋️ Спортивный магазин
      </h2>

      {/* Фильтры */}
      <div className="flex md:flex-row flex-col items-center gap-4 bg-white shadow-lg mb-10 p-6 rounded-3xl hover:scale-[1.01] transition-transform">
        <input 
          type="text"
          placeholder="Поиск по имени..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <select 
          value={category} 
          onChange={e => setCategory(e.target.value)}
          className="p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition cursor-pointer"
        >
          <option value="">Все категории</option>
          <option value="Кроссовки">Кроссовки</option>
          <option value="Футболки">Футболки</option>
          <option value="Шорты">Шорты</option>
        </select>
        <input 
          type="number" 
          placeholder="Цена от" 
          value={minPrice} 
          onChange={e => setMinPrice(e.target.value)}
          className="p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-32 transition"
        />
        <input 
          type="number" 
          placeholder="Цена до" 
          value={maxPrice} 
          onChange={e => setMaxPrice(e.target.value)}
          className="p-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-32 transition"
        />
      </div>

      {/* Сетка товаров */}
      <div className="gap-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(product => (
          <div 
            key={product.id} 
            className="flex flex-col justify-between bg-white shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden hover:scale-105 transition transform"
            style={{ height: "540px" }}
          >
            <Link to={`/product/${product.id}`} className="flex flex-col flex-1">
              {/* Фото */}
              <div className="group relative rounded-t-3xl h-64 overflow-hidden">
                <img 
                  src={product.image || "https://via.placeholder.com/400"} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Бейдж категории */}
                <div className="top-3 left-3 absolute bg-gradient-to-r from-green-500 to-green-300 shadow-md backdrop-blur-sm px-3 py-1 rounded-full font-semibold text-white text-sm">
                  {product.category}
                </div>
              </div>

              {/* Контент */}
              <div className="flex flex-col flex-1 justify-between p-5">
                <div>
                  <h3 className="font-bold text-blue-900 group-hover:text-blue-700 text-xl truncate transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-gray-700 text-sm line-clamp-3">
                    {product.description}
                  </p>
                </div>
                <p className="drop-shadow-sm mt-4 font-extrabold text-green-600 text-2xl">
                  {product.price} ₽
                </p>
              </div>
            </Link>

            {/* Кнопка премиум */}
            <button
              onClick={() => handleAdd(product.id)}
              className="flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg hover:shadow-2xl mx-5 my-4 px-6 py-3 rounded-2xl font-bold text-white hover:scale-105 transition-transform cursor-pointer hover:cursor-pointer transform"
            >
              🛒 Добавить в корзину
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}