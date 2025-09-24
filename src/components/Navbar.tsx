import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Безопасная проверка токена
  const token = useAppSelector((state) => state.auth?.token ?? null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="flex justify-between bg-blue-600 p-4 text-white">
      <div>
        <Link to="/" className="font-bold text-xl">
          Shop
        </Link>
      </div>
      <div>
        {token ? (
          <>
            <Link to="/cart" className="mr-4">
              Cart
            </Link>
            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">
              Login
            </Link>
            <Link to="/register" className="bg-green-500 px-3 py-1 rounded">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
