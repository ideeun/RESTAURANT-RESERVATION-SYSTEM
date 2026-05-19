"use client";

import Link from "next/link";
import MenuGrid from "@/components/MenuGrid";

export default function MenuPage() {
  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-semibold">Меню</h1>
        <p className="mt-1 text-sm text-[#8a847a]">Блюда French Touch · цены в сомах</p>
      </div>

      <MenuGrid />

      <div className="card text-center">
        <p className="text-sm text-[#8a847a]">Понравилось? Забронируйте стол</p>
        <Link href="/book" className="btn-primary mt-3 inline-block">
          Забронировать
        </Link>
      </div>
    </div>
  );
}

