"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/api";
import NumericInput from "@/components/NumericInput";
import type { DiningTableFloor } from "@/types";

interface BookingModalProps {
  table: DiningTableFloor;
  guestCount: number;
  onClose: () => void;
  onConfirm: (guests: number) => Promise<void>;
}

export default function BookingModal({ table, guestCount: initial, onClose, onConfirm }: BookingModalProps) {
  const [guests, setGuests] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (guests > table.capacity) {
      setError(`Максимум ${table.capacity} гостей`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onConfirm(guests);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="card w-full max-w-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Стол №{table.tableNumber}</h3>
          <button type="button" onClick={onClose} className="text-xl text-[#8a847a]">×</button>
        </div>
        <p className="mb-4 text-sm text-[#8a847a]">До {table.capacity} гостей</p>
        <label className="mb-4 block">
          <span className="label">Гостей</span>
          <NumericInput min={1} max={table.capacity} value={guests} onValueChange={setGuests} />
        </label>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button type="button" disabled={loading} onClick={submit} className="btn-primary">
          {loading ? "Сохранение…" : "Подтвердить"}
        </button>
      </div>
    </div>
  );
}
