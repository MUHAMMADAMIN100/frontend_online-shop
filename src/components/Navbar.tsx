import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export default function Navbar() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const navigate = useNavigate();

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="flex justify-between items-center bg-white shadow-md p-4">
      <Link to="/" className="font-bold text-xl">Shop</Link>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/cart")}
          className="relative bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
        >
          🛒 Корзина
          {totalCount > 0 && (
            <span className="-top-2 -right-2 absolute flex justify-center items-center bg-red-500 rounded-full w-5 h-5 text-xs">
              {totalCount}
            </span>
          )}
        </button>

        <Link to="/login" className="px-4 py-2 border rounded-lg">Войти</Link>
        <Link to="/register" className="px-4 py-2 border rounded-lg">Регистрация</Link>
      </div>
    </nav>
  );
}
