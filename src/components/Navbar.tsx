import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export default function Navbar() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const navigate = useNavigate();

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="flex sm:flex-row flex-col justify-between items-center gap-4 sm:gap-0 bg-white shadow-2xl px-6 py-4">
      {/* Логотип / Название */}
      <Link 
        to="/" 
        className="font-extrabold text-blue-900 hover:text-blue-800 text-2xl sm:text-3xl transition-colors"
      >
        🏋️ Shop
      </Link>

      {/* Навигация и кнопки */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => navigate("/cart")}
          className="relative bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg hover:shadow-2xl px-4 sm:px-5 py-2 sm:py-3 rounded-2xl font-semibold text-white hover:scale-105 transition-transform duration-300 cursor-pointer"
        >
          🛒 Корзина
          {totalCount > 0 && (
            <span className="-top-2 -right-2 absolute flex justify-center items-center bg-red-500 shadow-md rounded-full w-5 h-5 font-bold text-white text-xs">
              {totalCount}
            </span>
          )}
        </button>

        <Link 
          to="/login" 
          className="hover:bg-blue-600 px-4 sm:px-5 py-2 sm:py-3 border-2 border-blue-600 rounded-2xl font-semibold text-blue-600 hover:text-white transition-all duration-300"
        >
          Войти
        </Link>
        <Link 
          to="/register" 
          className="hover:bg-green-600 px-4 sm:px-5 py-2 sm:py-3 border-2 border-green-600 rounded-2xl font-semibold text-green-600 hover:text-white transition-all duration-300"
        >
          Регистрация
        </Link>
      </div>
    </nav>
  );
}