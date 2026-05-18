"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getErrorMessage, login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(username, password);
      saveAuth(data);
      router.push(data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="font-display text-2xl font-semibold">Вход</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Логин</span>
            <input
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Пароль</span>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-600">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-brand-600 hover:underline">
            Регистрация
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-stone-500">
          Демо: demo / User123! · admin / Admin123!
        </p>
      </div>
    </div>
  );
}
