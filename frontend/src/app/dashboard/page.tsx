"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale/ru";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import StatusChip from "@/components/StatusChip";
import { fetchMyBookings, getErrorMessage } from "@/lib/api";
import type { Reservation } from "@/types";

function DashboardContent() {
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBookings()
      .then(setBookings)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4b5a0] border-t-[#8b7355]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Мои брони</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {bookings.length === 0 ? (
        <div className="card text-center">
          <p className="text-[#8a847a]">Пока нет бронирований</p>
          <Link href="/book" className="btn-primary mt-4 inline-block">Забронировать</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Стол №{b.tableNumber}</p>
                  <p className="text-sm text-[#8a847a]">{b.branchName} · {b.hallName}</p>
                  <p className="text-sm text-[#8a847a]">
                    {format(parseISO(b.reservationTime), "d MMMM yyyy, HH:mm", { locale: ru })}
                  </p>
                  <p className="text-xs text-[#8a847a]">{b.guestCount} гостей · {b.duration} мин</p>
                </div>
                <StatusChip status={b.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return <AuthGuard><DashboardContent /></AuthGuard>;
}
