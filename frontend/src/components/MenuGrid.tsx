"use client";

import { useEffect, useState } from "react";
import { fetchMenu, getErrorMessage, menuImageUrl } from "@/lib/api";
import { formatPrice } from "@/lib/currency";
import type { MenuItem } from "@/types";

export default function MenuGrid() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu()
      .then(setItems)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4b5a0] border-t-[#8b7355]" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-[#8a847a]">Меню скоро появится</p>;
  }

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <section key={cat}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8a847a]">{cat}</h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {items
              .filter((i) => i.category === cat)
              .map((item) => {
                const img = menuImageUrl(item.imageUrl);
                return (
                  <li key={item.id} className="card flex gap-3 overflow-hidden p-0">
                    <div className="relative h-24 w-24 shrink-0 bg-[#f0ebe3]">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-[#c4b5a0]">
                          🍽
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center py-2 pr-3">
                      <p className="font-medium leading-tight">{item.name}</p>
                      {item.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-[#8a847a]">{item.description}</p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-[#8b7355]">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </div>
  );
}
