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

  const handleAdd = (productId: number) => {
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const handleRemove = (productId: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    if (item.quantity > 1) {
      dispatch(addToCart({ productId, quantity: -1 }));
    } else {
      dispatch(removeFromCart(item.id));
    }
  };

  const handleDelete = (cartItemId: number) => {
    dispatch(removeFromCart(cartItemId));
  };

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

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

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
      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: name,
          phone,
          address,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Заказ успешно создан!",
          showConfirmButton: false,
          timer: 1500,
        });
        dispatch(clearCart());
        setShowCheckout(false);
        setOrderCompleted(true);
        setName("");
        setPhone("");
        setAddress("");
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
    return (
      <p className="mt-10 text-gray-500 text-lg text-center">Loading...</p>
    );

  return (
    <div className="relative mx-auto p-6 max-w-5xl">
      <h2 className="mb-6 font-bold text-blue-700 text-3xl text-center">
        🛒 Корзина
      </h2>

      {items.length === 0 && !orderCompleted ? (
        <p className="text-gray-600 text-xl text-center">Корзина пуста</p>
      ) : (
        <>
          {items.length > 0 && (
            <>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex md:flex-row flex-col justify-between items-center bg-white shadow-md hover:shadow-xl p-4 rounded-xl hover:scale-102 transition transform"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.image || "https://via.placeholder.com/80"}
                        alt={item.product.name}
                        className="rounded-lg w-20 h-20 object-cover hover:scale-105 transition-transform"
                      />
                      <div>
                        <h3 className="font-semibold text-blue-800 text-lg">
                          {item.product.name}
                        </h3>
                        <p className="text-gray-500">{item.product.price}₽</p>
                        <p className="mt-1 text-gray-600">Кол-во: {item.quantity}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 md:mt-0">
                      <button
                        onClick={() => handleAdd(item.productId)}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white hover:scale-105 transition cursor-pointer transform"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-white hover:scale-105 transition cursor-pointer transform"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white hover:scale-105 transition cursor-pointer transform"
                      >
                        Удалить
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex md:flex-row flex-col justify-between items-center gap-2 bg-gray-100 shadow-md mt-6 p-4 rounded-xl">
                <p className="font-semibold text-xl">Итого: {totalPrice.toFixed(2)}₽</p>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-white hover:scale-105 transition cursor-pointer transform"
                  >
                    Оформить заказ
                  </button>
                  <button
                    onClick={handleClear}
                    className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-white hover:scale-105 transition cursor-pointer transform"
                  >
                    Очистить корзину
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Модальное окно */}
     {/* Модальное окно */}
{showCheckout && (
  <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/20 animate-fadeIn">
    <div className="bg-white shadow-xl p-6 rounded-xl w-full max-w-md animate-scaleUp">
      <h3 className="mb-4 font-semibold text-blue-800 text-2xl text-center">
        Форма заказа
      </h3>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded focus:outline-blue-500 w-full"
        />
        <input
          type="text"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-2 border rounded focus:outline-blue-500 w-full"
        />
        <input
          type="text"
          placeholder="Адрес"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="p-2 border rounded focus:outline-blue-500 w-full"
        />
        <div className="flex justify-between gap-2 mt-3">
          <button
            onClick={handleCheckout}
            disabled={orderLoading}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg w-1/2 font-semibold text-white hover:scale-105 transition cursor-pointer transform"
          >
            {orderLoading ? "Создание..." : "Создать заказ"}
          </button>
          <button
            onClick={() => setShowCheckout(false)}
            className="bg-gray-400 hover:bg-gray-500 px-4 py-2 rounded-lg w-1/2 text-white hover:scale-105 transition cursor-pointer transform"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
)}


      {orderCompleted && (
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/orderHistory")}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-white hover:scale-105 transition cursor-pointer transform"
          >
            Посмотреть историю заказов
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
