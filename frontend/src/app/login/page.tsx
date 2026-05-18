"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { getErrorMessage, login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
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
      router.push(data.role === "ADMIN" ? "/admin" : next);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm pt-8">
      <div className="card">
        <h1 className="text-xl font-semibold">Вход</h1>
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input className="input-field" placeholder="Логин" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" className="input-field" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "…" : "Войти"}</button>
        </form>
        <p className="mt-4 text-center text-sm text-[#8a847a]">
          <Link href="/register" className="font-medium text-[#8b7355]">Регистрация</Link>
        </p>
        <p className="mt-2 text-center text-xs text-[#8a847a]">demo / User123!</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
