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
    axios.get(`http://localhost:3001/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleAdd = async () => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Войдите в аккаунт',
        text: 'Чтобы добавить товар в корзину, необходимо авторизоваться',
      });
      return;
    }
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
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

  if (!product) return (
    <div className="flex justify-center items-center h-screen text-gray-500 text-base">
      Загрузка...
    </div>
  );

  return (
    <div className="bg-white shadow-md hover:shadow-lg mx-auto mt-8 rounded-lg max-w-sm overflow-hidden transition-shadow">
      {/* Фото товара */}
      <img
        src={product.image || "https://via.placeholder.com/300"}
        alt={product.name}
        className="w-full h-90px object-cover"
      />

      {/* Информация о товаре */}
      <div className="flex flex-col gap-2 p-4">
        <h2 className="font-bold text-blue-800 text-lg">{product.name}</h2>
        <p className="text-gray-700 text-sm">{product.description}</p>
        <p className="font-bold text-green-600 text-md">{product.price} $</p>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-800 mt-2 py-2 rounded-md font-semibold text-white text-sm hover:scale-105 transition-transform transform"
        >
          🛒 В корзину
        </button>
      </div>
    </div>
  );
}
