import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Неправильный логин или пароль");
      }

      const data = await res.json();

      // Сохраняем токен в localStorage
      localStorage.setItem("token", data.accessToken); // или data.token, если сервер так возвращает

      // Перенаправляем пользователя на главную
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Ошибка при логине");
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-3 mx-auto mt-20 w-80">
      <h2 className="font-bold text-2xl text-center">Вход</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
      />
      <button type="submit" className="bg-blue-500 p-2 rounded text-white">
        Войти
      </button>
    </form>
  );
}
