"use client";

import type { DiningTable } from "@/types";
import clsx from "clsx";

interface TableListProps {
  tables: DiningTable[];
  selectedId?: number | null;
  onSelect?: (table: DiningTable) => void;
  loading?: boolean;
}

export default function TableList({
  tables,
  selectedId,
  onSelect,
  loading,
}: TableListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <p className="rounded-lg bg-stone-100 px-4 py-6 text-center text-stone-600">
        Нет свободных столиков на выбранное время.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tables.map((table) => (
        <li key={table.id}>
          <button
            type="button"
            onClick={() => onSelect?.(table)}
            disabled={!onSelect}
            className={clsx(
              "card w-full text-left transition",
              onSelect && "cursor-pointer hover:border-brand-400 hover:shadow-md",
              selectedId === table.id && "border-brand-500 ring-2 ring-brand-500/30"
            )}
          >
            <p className="font-display text-lg font-semibold">Стол №{table.tableNumber}</p>
            <p className="mt-1 text-sm text-stone-600">Вместимость: {table.capacity} гостей</p>
            <p className="mt-2 text-xs uppercase tracking-wide text-brand-600">{table.status}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
