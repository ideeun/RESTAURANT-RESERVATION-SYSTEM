"use client";

import { useState } from "react";
import type { DiningTable } from "@/types";
import DateTimePicker from "./DateTimePicker";
import NumericInput from "./NumericInput";

interface ReservationFormProps {
  table: DiningTable | null;
  initialDate?: string;
  initialTime?: string;
  onSubmit: (data: {
    reservationTime: string;
    duration: number;
    guestCount: number;
  }) => Promise<void>;
}

export default function ReservationForm({
  table,
  initialDate = "",
  initialTime = "",
  onSubmit,
}: ReservationFormProps) {
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [duration, setDuration] = useState(90);
  const [guestCount, setGuestCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!table) {
      setError("Выберите столик");
      return;
    }
    if (guestCount > table.capacity) {
      setError(`Максимум ${table.capacity} гостей для этого столика`);
      return;
    }
    setLoading(true);
    try {
      const reservationTime = `${date}T${time}:00`;
      await onSubmit({ reservationTime, duration, guestCount });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка бронирования");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="font-display text-xl font-semibold">Детали бронирования</h2>
      {table ? (
        <p className="text-sm text-stone-600">
          Стол №{table.tableNumber} · до {table.capacity} гостей
        </p>
      ) : (
        <p className="text-sm text-amber-700">Сначала выберите столик</p>
      )}
      <DateTimePicker date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Длительность (мин)</span>
          <NumericInput min={30} step={15} value={duration} onValueChange={setDuration} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Гостей</span>
          <NumericInput
            min={1}
            max={table?.capacity ?? 20}
            value={guestCount}
            onValueChange={setGuestCount}
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading || !table} className="btn-primary w-full">
        {loading ? "Сохранение…" : "Забронировать"}
      </button>
    </form>
  );
}
