import React, { useState } from 'react';
import api from '../api/axios';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const token = res.data.access_token;
      // Если бэкенд возвращает userId и роль, можно передать их сюда
      dispatch(setCredentials({ token }));
      nav('/'); // Перенаправляем на главную после регистрации
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white shadow mx-auto mt-10 p-6 rounded max-w-md"
    >
      <h2 className="mb-4 font-bold text-2xl">Register</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-3 p-2 border rounded w-full"
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 p-2 border rounded w-full"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
        required
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 py-2 rounded w-full text-white"
      >
        Register
      </button>
    </form>
  );
}
