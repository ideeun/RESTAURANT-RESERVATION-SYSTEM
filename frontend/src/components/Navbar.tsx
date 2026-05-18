"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearAuth,
  getStoredUser,
  isAdmin,
  isAuthenticated,
  type StoredUser,
} from "@/lib/auth";
import clsx from "clsx";

const links = [
  { href: "/", label: "Поиск столиков" },
  { href: "/reserve", label: "Бронирование", auth: true },
  { href: "/dashboard", label: "Мои брони", auth: true },
  { href: "/admin", label: "Админ", admin: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setMounted(true);
  }, [pathname]);

  const logout = () => {
    clearAuth();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl font-semibold text-brand-700">
          La Table
        </Link>
        <div className="flex items-center gap-4">
          {links.map((link) => {
            if (link.auth && mounted && !isAuthenticated()) return null;
            if (link.admin && mounted && !isAdmin()) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium transition",
                  pathname === link.href
                    ? "text-brand-600"
                    : "text-stone-600 hover:text-brand-600"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {mounted && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500">{user.username}</span>
              <button type="button" onClick={logout} className="btn-secondary text-sm">
                Выйти
              </button>
            </div>
          ) : mounted ? (
            <Link href="/login" className="btn-primary text-sm">
              Войти
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
