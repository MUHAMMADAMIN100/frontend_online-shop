import React, { useState } from 'react';
import api from '../api/axios';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { parseJwt } from '../utils/jwt';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { email, password });
      // если бэкенд возвращает token
      const token = res.data.access_token ?? res.data.token;
      if (token) {
        const payload = parseJwt(token);
        const userId = payload?.userId ?? payload?.userID ?? payload?.user_id;
        const role = payload?.role;
        dispatch(setCredentials({ token, userId, role }));
      }
      nav('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <form onSubmit={submit} className="bg-white shadow mx-auto mt-10 p-6 rounded max-w-md">
      <h2 className="mb-4 font-bold text-2xl">Register</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 p-2 border rounded w-full" />
      <button className="bg-green-600 py-2 rounded w-full text-white">Register</button>
    </form>
  );
}
