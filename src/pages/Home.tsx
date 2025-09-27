import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
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
    if (!token) return alert("Войдите, чтобы добавить в корзину");
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      alert("Товар добавлен в корзину");
    } catch (err: any) {
      console.error(err);
      alert("Ошибка при добавлении товара");
    }
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 font-bold text-2xl">Каталог товаров</h2>

      <div className="flex md:flex-row flex-col items-center gap-4 bg-white shadow-md mb-6 p-4 rounded-xl">
        <input type="text" placeholder="Поиск по имени..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 p-2 border rounded-lg"/>
        <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-lg">
          <option value="">Все категории</option>
          <option value="Обувь">Обувь</option>
          <option value="Одежда">Одежда</option>
          <option value="Штаны">Штаны</option>
        </select>
        <input type="number" placeholder="Цена от" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="p-2 border rounded-lg w-28"/>
        <input type="number" placeholder="Цена до" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="p-2 border rounded-lg w-28"/>
      </div>

      <div className="gap-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map(product => (
          <div key={product.id} className="flex flex-col justify-between bg-white shadow-md hover:shadow-lg p-4 rounded-xl transition">
            <Link to={`/product/${product.id}`}>
              <img src={product.image || "https://via.placeholder.com/200"} alt={product.name} className="mb-4 rounded-lg w-full h-40 object-cover"/>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="mt-2 font-bold text-xl">{product.price} $</p>
            </Link>
            <button onClick={() => handleAdd(product.id)} className="bg-blue-600 hover:bg-blue-700 mt-4 px-4 py-2 rounded-lg text-white transition">
              🛒 В корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
