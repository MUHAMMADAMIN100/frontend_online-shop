import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // Сохраняем токен корректно
        localStorage.setItem('token', data.access_token);

        // Редирект на главную страницу
        navigate('/');
      } else {
        alert(data.message || 'Ошибка при логине');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при подключении к серверу');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="bg-white shadow-md p-6 rounded w-96" onSubmit={handleSubmit}>
        <h2 className="mb-4 font-bold text-2xl">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-3 p-2 border rounded w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mb-3 p-2 border rounded w-full"
          required
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 p-2 rounded w-full text-white">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
