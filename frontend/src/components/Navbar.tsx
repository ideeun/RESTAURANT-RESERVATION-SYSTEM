"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuth, getStoredUser, isAdmin, isAuthenticated, type StoredUser } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
    setMounted(true);
  }, [pathname]);

  if (pathname === "/") return null;

  return (
    <header className="flex items-center justify-between border-b border-[#ebe6dc] py-3">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        French Touch
      </Link>
      <div className="flex items-center gap-2">
        {mounted && isAdmin() && (
          <Link href="/admin" className="text-xs font-medium text-[#8b7355]">Админ</Link>
        )}
        {mounted && user ? (
          <button type="button" onClick={() => { clearAuth(); router.push("/login"); }} className="btn-secondary text-xs">
            Выйти
          </button>
        ) : mounted ? (
          <Link href="/login" className="btn-secondary text-xs">Войти</Link>
        ) : null}
      </div>
    </header>
  );
}
