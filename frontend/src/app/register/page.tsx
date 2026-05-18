"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getErrorMessage, register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await register(username.trim(), email.trim(), password);
      saveAuth(data);
      router.push("/book");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm pt-8">
      <div className="card">
        <h1 className="text-xl font-semibold">Регистрация</h1>
        <p className="mt-1 text-sm text-[#8a847a]">Создайте аккаунт для бронирования столов</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block">
            <span className="label">Логин</span>
            <input
              className="input-field"
              placeholder="минимум 3 символа"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={50}
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="label">Email</span>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="block">
            <span className="label">Пароль</span>
            <input
              type="password"
              className="input-field"
              placeholder="минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              required
            />
          </label>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Создание…" : "Создать аккаунт"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#8a847a]">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-[#8b7355]">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
