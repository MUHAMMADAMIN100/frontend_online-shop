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
    axios.get(`https://backend-online-shop-vrxj.onrender.com/products/${id}`)
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
    <div className="flex justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-6 min-h-screen">
      <div className="bg-white shadow-2xl mx-auto rounded-3xl max-w-md sm:max-w-lg md:max-w-xl overflow-hidden hover:scale-105 transition-transform duration-300">
        
        {/* Фото товара */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            src={product.image || "https://via.placeholder.com/400"}
            alt={product.name}
            className="rounded-t-3xl w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="top-3 left-3 absolute bg-gradient-to-r from-green-500 to-green-300 shadow-md px-4 py-1 rounded-full font-bold text-white text-sm sm:text-base">
            {product.category}
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <h2 className="font-extrabold text-blue-900 text-xl sm:text-2xl md:text-3xl truncate">{product.name}</h2>
          <p className="mt-2 text-gray-700 text-sm sm:text-base md:text-lg line-clamp-4">{product.description}</p>
          <p className="mt-4 font-extrabold text-green-600 text-2xl sm:text-3xl md:text-4xl">{product.price} ₽</p>

          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg hover:shadow-2xl mt-6 px-6 py-3 sm:py-4 rounded-2xl font-bold text-white text-base sm:text-lg md:text-xl hover:scale-105 transition-transform duration-300 cursor-pointer hover:cursor-pointer"
          >
            🛒 Добавить в корзину
          </button>
        </div>
      </div>
    </div>
  );
}