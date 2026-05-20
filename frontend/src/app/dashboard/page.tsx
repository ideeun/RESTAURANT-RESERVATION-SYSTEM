"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale/ru";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import StatusChip from "@/components/StatusChip";
import AdminConfirmModal from "@/components/AdminConfirmModal";
import { IconCancelBooking } from "@/components/NavIcon";
import { cancelMyBooking, fetchMyBookings, getErrorMessage } from "@/lib/api";
import { applyReservationEvent, subscribeMyBookings } from "@/lib/realtime";
import type { Reservation } from "@/types";

function DashboardContent() {
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ id: number; summary: string } | null>(null);

  useEffect(() => {
    fetchMyBookings()
      .then(setBookings)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return subscribeMyBookings((event) => {
      setBookings((prev) => applyReservationEvent(prev, event));
    });
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
      <AdminConfirmModal
        open={cancelTarget !== null}
        title="Отменить бронь?"
        message={
          cancelTarget
            ? `${cancelTarget.summary} Статус изменится на «Отменена», стол снова станет доступен.`
            : ""
        }
        variant="confirm"
        danger
        confirmLabel="Отменить бронь"
        cancelLabel="Не сейчас"
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return;
          try {
            setError(null);
            const updated = await cancelMyBooking(cancelTarget.id);
            setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          } catch (e) {
            setError(getErrorMessage(e));
          }
        }}
      />

      <h1 className="text-2xl font-semibold">Мои брони</h1>
      <p className="text-sm text-[#8a847a]">
        Активную бронь можно отменить значком корзины справа от статуса.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {bookings.length === 0 ? (
        <div className="card text-center">
          <p className="text-[#8a847a]">Пока нет бронирований</p>
          <Link href="/book" className="btn-primary mt-4 inline-block">
            Забронировать
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => {
            const canCancel = b.status !== "CANCELLED" && b.status !== "COMPLETED";
            const branchLine =
              b.branchId != null
                ? `Филиал №${b.branchId}${b.branchName ? ` · ${b.branchName}` : ""}`
                : (b.branchName ?? "Филиал");
            const hallLine =
              b.hallId != null
                ? `Зал №${b.hallId}${b.hallName ? ` · ${b.hallName}` : ""}`
                : (b.hallName ?? "Зал");
            const summary = `Стол №${b.tableNumber}, ${branchLine}, ${hallLine}, ${format(parseISO(b.reservationTime), "d MMM yyyy, HH:mm", { locale: ru })}.`;
            return (
              <li key={b.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium">Стол №{b.tableNumber}</p>
                    <p className="text-sm text-[#5c574f]">{branchLine}</p>
                    <p className="text-sm text-[#8a847a]">{hallLine}</p>
                    <p className="text-sm text-[#8a847a]">
                      {format(parseISO(b.reservationTime), "d MMMM yyyy, HH:mm", { locale: ru })}
                    </p>
                    <p className="text-xs text-[#8a847a]">
                      {b.guestCount} гостей · {b.duration} мин
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusChip status={b.status} />
                    {canCancel && (
                      <button
                        type="button"
                        title="Отменить бронь"
                        aria-label="Отменить бронь"
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        onClick={() => setCancelTarget({ id: b.id, summary })}
                      >
                        <IconCancelBooking className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
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
