import React, { useState } from 'react';
import api from '../api/axios';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('123456');
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.access_token;
    // token payload contains userId and role — if you want to decode put userId in local storage (backend can return too)
    dispatch(setCredentials({ token }));
    nav('/');
  };

  return (
    <form onSubmit={submit} className="bg-white mx-auto p-4 rounded max-w-md">
      <h2 className="mb-4 font-bold text-xl">Login</h2>
      <input className="mb-2 p-2 border rounded w-full" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="mb-2 p-2 border rounded w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 px-4 py-2 rounded text-white">Login</button>
    </form>
  );
}
