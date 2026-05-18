"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DateTimePicker from "@/components/DateTimePicker";
import TableList from "@/components/TableList";
import { fetchAvailableTables, getErrorMessage } from "@/lib/api";
import { defaultSearchDate, defaultSearchTime, toApiDateTime } from "@/lib/datetime";
import type { DiningTable } from "@/types";

export default function HomeSearch() {
  const router = useRouter();
  const [date, setDate] = useState(defaultSearchDate());
  const [time, setTime] = useState(defaultSearchTime());
  const [duration, setDuration] = useState(90);
  const [guestCount, setGuestCount] = useState(2);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const dateTime = toApiDateTime(date, time);
      const data = await fetchAvailableTables(dateTime, duration, guestCount);
      setTables(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const bookTable = (table: DiningTable) => {
    const params = new URLSearchParams({
      tableId: String(table.id),
      date,
      time,
      duration: String(duration),
      guests: String(guestCount),
    });
    router.push(`/reserve?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <section className="card">
        <h1 className="font-display text-3xl font-semibold text-brand-900">
          Найдите свободный столик
        </h1>
        <p className="mt-2 text-stone-600">
          Укажите дату, время и количество гостей — мы покажем доступные столы.
        </p>
        <form onSubmit={search} className="mt-6 space-y-4">
          <DateTimePicker date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Длительность (мин)</span>
              <input
                type="number"
                min={30}
                className="input-field"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Гостей</span>
              <input
                type="number"
                min={1}
                className="input-field"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
              />
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Поиск…" : "Найти столики"}
          </button>
        </form>
      </section>

      {searched && (
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">Доступные столики</h2>
          <TableList tables={tables} loading={loading} onSelect={bookTable} />
        </section>
      )}
    </div>
  );
}
