import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      const query = new URLSearchParams();

      if (search) query.append("search", search);
      if (category) query.append("category", category);
      if (minPrice) query.append("minPrice", minPrice);
      if (maxPrice) query.append("maxPrice", maxPrice);
      if (sort) query.append("sort", sort);

      const res = await fetch(`http://localhost:3001/products?${query.toString()}`);
      const data = await res.json();
      setProducts(data);
    };

    fetchProducts();
  }, [search, category, minPrice, maxPrice, sort]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Все продукты</h1>

      {/* Фильтры */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Поиск по названию"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Все категории</option>
          <option value="Одежда">Одежда</option>
          <option value="Обувь">Обувь</option>
          <option value="Штаны">Штаны</option>
          <option value="equipment">Оборудование</option>
          <option value="nutrition">Питание</option>
        </select>

        <input
          type="number"
          placeholder="Мин. цена"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Макс. цена"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Без сортировки</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="name_asc">Название: A-Z</option>
          <option value="name_desc">Название: Z-A</option>
        </select>
      </div>

      {/* Список продуктов */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
              <Link to={`/products/${p.id}`}>
                <img src={p.image} alt={p.name} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
                <h3>{p.name}</h3>
              </Link>
              <p>{p.price} $</p>
              <p>{p.category}</p>
              <button onClick={() => dispatch(addToCart(p))}>
                Добавить в корзину
              </button>
            </div>
          ))
        ) : (
          <p>Нет продуктов</p>
        )}
      </div>
    </div>
  );
}
