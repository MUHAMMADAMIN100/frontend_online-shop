import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { addToCart } from "../features/cart/cartSlice";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    axios.get(`http://localhost:3001/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleAdd = () => {
    if (!token) return alert("Войдите, чтобы добавить в корзину");
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  if (!product) return <div>Загрузка...</div>;

  return (
    <div className="flex md:flex-row flex-col gap-6 p-6">
      <img src={product.image || "https://via.placeholder.com/300"} alt={product.name} className="rounded-lg w-full md:w-1/2 h-auto"/>
      <div className="flex-1">
        <h2 className="mb-4 font-bold text-3xl">{product.name}</h2>
        <p className="mb-4">{product.description}</p>
        <p className="mb-4 font-bold text-2xl">{product.price} $</p>
        <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white transition">
          🛒 В корзину
        </button>
      </div>
    </div>
  );
}
