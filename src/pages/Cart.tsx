import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../features/cart/cartSlice";
import type { RootState } from "../app/store";

const Cart: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state: RootState) => state.cart);
  const { token } = useSelector((state: RootState) => state.auth);

  const [showCheckout, setShowCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleAdd = (productId: number) => dispatch(addToCart({ productId, quantity: 1 }));
  const handleRemove = (productId: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    item.quantity > 1
      ? dispatch(addToCart({ productId, quantity: -1 }))
      : dispatch(removeFromCart(item.id));
  };
  const handleDelete = (cartItemId: number) => dispatch(removeFromCart(cartItemId));
  const handleClear = () => {
    Swal.fire({
      title: "Вы уверены?",
      text: "Это очистит всю корзину!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Да, очистить",
      cancelButtonText: "Отмена",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(clearCart());
        Swal.fire("Очищено!", "Корзина была очищена.", "success");
      }
    });
  };

  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const handleCheckout = async () => {
    if (!name || !phone || !address) {
      Swal.fire({
        icon: "warning",
        title: "Заполните все поля",
        text: "Пожалуйста, заполните форму заказа полностью.",
      });
      return;
    }
    setOrderLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerName: name,
          phone,
          address,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        }),
      });
      if (response.ok) {
        Swal.fire({ icon: "success", title: "Заказ успешно создан!", showConfirmButton: false, timer: 1500 });
        dispatch(clearCart());
        setShowCheckout(false);
        setOrderCompleted(true);
        setName(""); setPhone(""); setAddress("");
      } else {
        const errorText = await response.text();
        console.error(errorText);
        Swal.fire("Ошибка", "Не удалось создать заказ", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Ошибка", "Не удалось создать заказ", "error");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading)
    return <p className="mt-10 text-gray-500 text-lg text-center">Loading...</p>;

  return (
    <div className="relative mx-auto p-6 max-w-6xl">
      <h2 className="drop-shadow-lg mb-8 font-extrabold text-blue-900 text-4xl text-center">🛒 Корзина</h2>

      {items.length === 0 && !orderCompleted ? (
        <p className="text-gray-600 text-xl text-center">Корзина пуста</p>
      ) : (
        <>
          {items.length > 0 && (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex md:flex-row flex-col justify-between items-center bg-white shadow-xl hover:shadow-2xl p-5 rounded-3xl hover:scale-105 transition-transform transform"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.product.image || "https://via.placeholder.com/100"}
                      alt={item.product.name}
                      className="rounded-2xl w-24 h-24 object-cover hover:scale-110 transition-transform"
                    />
                    <div>
                      <h3 className="font-bold text-blue-900 text-lg">{item.product.name}</h3>
                      <p className="font-extrabold text-green-600">{item.product.price} ₽</p>
                      <p className="text-gray-500">Кол-во: {item.quantity}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 md:mt-0">
                    <button
                      onClick={() => handleAdd(item.productId)}
                      className="bg-gradient-to-r from-green-500 hover:from-green-600 to-green-600 hover:to-green-700 px-5 py-2 rounded-2xl font-semibold text-white hover:scale-105 transition-transform cursor-pointer transform"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="bg-gradient-to-r from-yellow-400 hover:from-yellow-500 to-yellow-500 hover:to-yellow-600 px-5 py-2 rounded-2xl font-semibold text-white hover:scale-105 transition-transform cursor-pointer transform"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-gradient-to-r from-red-500 hover:from-red-600 to-red-600 hover:to-red-700 px-5 py-2 rounded-2xl font-semibold text-white hover:scale-105 transition-transform cursor-pointer transform"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Итого и действия */}
          <div className="flex md:flex-row flex-col justify-between items-center gap-4 bg-gray-100 shadow-lg mt-8 p-5 rounded-2xl">
            <p className="font-extrabold text-blue-900 text-xl">Итого: {totalPrice.toFixed(2)} ₽</p>
            <div className="flex sm:flex-row flex-col gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-gradient-to-r from-blue-600 hover:from-blue-700 to-blue-800 hover:to-blue-900 px-6 py-3 rounded-2xl font-bold text-white hover:scale-105 transition-transform transform"
              >
                Оформить заказ
              </button>
              <button
                onClick={handleClear}
                className="bg-gradient-to-r from-red-500 hover:from-red-600 to-red-600 hover:to-red-700 px-6 py-3 rounded-2xl font-bold text-white hover:scale-105 transition-transform transform"
              >
                Очистить корзину
              </button>
            </div>
          </div>
        </>
      )}

      {/* Модальное окно оформления заказа */}
      {showCheckout && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/25 animate-fadeIn">
          <div className="bg-white shadow-2xl p-6 rounded-3xl w-full max-w-md animate-scaleUp">
            <h3 className="mb-6 font-extrabold text-blue-900 text-2xl text-center">Форма заказа</h3>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 border rounded-2xl focus:outline-blue-500 w-full"
              />
              <input
                type="text"
                placeholder="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="p-3 border rounded-2xl focus:outline-blue-500 w-full"
              />
              <input
                type="text"
                placeholder="Адрес"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="p-3 border rounded-2xl focus:outline-blue-500 w-full"
              />
              <div className="flex sm:flex-row flex-col gap-3 mt-4">
                <button
                  onClick={handleCheckout}
                  disabled={orderLoading}
                  className="bg-gradient-to-r from-green-500 hover:from-green-600 to-green-600 hover:to-green-700 px-6 py-3 rounded-2xl w-full sm:w-1/2 font-bold text-white hover:scale-105 transition-transform transform"
                >
                  {orderLoading ? "Создание..." : "Создать заказ"}
                </button>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="bg-gray-400 hover:bg-gray-500 px-6 py-3 rounded-2xl w-full sm:w-1/2 font-bold text-white hover:scale-105 transition-transform transform"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orderCompleted && (
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/orderHistory")}
            className="bg-gradient-to-r from-purple-600 hover:from-purple-700 to-purple-700 hover:to-purple-800 px-6 py-3 rounded-2xl font-bold text-white hover:scale-105 transition-transform transform"
          >
            Посмотреть историю заказов
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;