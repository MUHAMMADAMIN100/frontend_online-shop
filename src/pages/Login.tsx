import React, { useState } from 'react';
import api from '../api/axios';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { parseJwt } from '../utils/jwt';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('123456');
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.access_token;
      const payload = parseJwt(token);
      const userId = payload?.userId ?? payload?.userID ?? payload?.user_id;
      const role = payload?.role;
      dispatch(setCredentials({ token, userId, role }));
      nav('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка логина');
    }
  };

  return (
    <form onSubmit={submit} className="bg-white shadow mx-auto mt-10 p-6 rounded max-w-md">
      <h2 className="mb-4 font-bold text-2xl">Login</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} className="mb-2 p-2 border rounded w-full" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 p-2 border rounded w-full" />
      <button className="bg-blue-600 py-2 rounded w-full text-white">Login</button>
    </form>
  );
}
