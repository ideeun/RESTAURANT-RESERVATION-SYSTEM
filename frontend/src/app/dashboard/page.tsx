"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale/ru";
import AuthGuard from "@/components/AuthGuard";
import { fetchMyBookings, getErrorMessage } from "@/lib/api";
import type { Reservation } from "@/types";

function DashboardContent() {
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBookings()
      .then(setBookings)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Мои бронирования</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {bookings.length === 0 ? (
        <p className="mt-6 text-stone-600">У вас пока нет бронирований.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold">Стол №{b.tableNumber}</p>
                <p className="text-sm text-stone-600">
                  {format(parseISO(b.reservationTime), "d MMMM yyyy, HH:mm", { locale: ru })}
                </p>
                <p className="text-sm text-stone-500">
                  {b.guestCount} гостей · {b.duration} мин
                </p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800">
                {b.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
