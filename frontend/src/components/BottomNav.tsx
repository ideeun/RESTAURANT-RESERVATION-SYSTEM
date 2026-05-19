"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { IconCalendar, IconHome, IconMenu, IconUser } from "@/components/NavIcon";
import { isAuthenticated } from "@/lib/auth";

const items: {
  href: string;
  label: string;
  Icon: typeof IconHome;
  auth?: boolean;
}[] = [
  { href: "/", label: "Главная", Icon: IconHome },
  { href: "/menu", label: "Меню", Icon: IconMenu },
  { href: "/book", label: "Бронь", Icon: IconCalendar },
  { href: "/dashboard", label: "Мои", Icon: IconUser, auth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => setAuthed(isAuthenticated()), [pathname]);

  if (["/login", "/register", "/admin"].includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#ebe6dc] bg-white/95 backdrop-blur">
      <div className="app-container flex h-[3.75rem] items-stretch justify-around">
        {items.map(({ href, label, Icon, auth }) => {
          if (auth && !authed) return null;
          const active =
            pathname === href ||
            (href === "/book" && pathname.startsWith("/book")) ||
            (href === "/menu" && pathname.startsWith("/menu"));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition",
                active ? "text-[#8b7355]" : "text-[#8a847a]"
              )}
            >
              <Icon className={clsx("h-5 w-5", active ? "stroke-[2]" : "stroke-[1.75]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
