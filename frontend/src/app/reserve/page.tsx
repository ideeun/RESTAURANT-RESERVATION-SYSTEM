"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import ReservationForm from "@/components/ReservationForm";
import { createReservation, fetchAvailableTables, getErrorMessage } from "@/lib/api";
import { toApiDateTime } from "@/lib/datetime";
import type { DiningTable } from "@/types";

function ReserveContent() {
  const router = useRouter();
  const params = useSearchParams();
  const tableId = params.get("tableId");
  const date = params.get("date") ?? "";
  const time = params.get("time") ?? "";
  const duration = Number(params.get("duration") ?? 90);
  const guests = Number(params.get("guests") ?? 2);

  const [table, setTable] = useState<DiningTable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!tableId || !date || !time) {
        setLoading(false);
        return;
      }
      try {
        const dateTime = toApiDateTime(date, time);
        const tables = await fetchAvailableTables(dateTime, duration, guests);
        const found = tables.find((t) => t.id === Number(tableId));
        setTable(found ?? null);
      } catch {
        setTable(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tableId, date, time, duration, guests]);

  const handleSubmit = async (data: {
    reservationTime: string;
    duration: number;
    guestCount: number;
  }) => {
    if (!table) return;
    try {
      await createReservation({
        tableId: table.id,
        ...data,
      });
      router.push("/dashboard");
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-3xl font-semibold">Бронирование</h1>
      {!table && tableId && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-amber-800">
          Столик недоступен на выбранное время. Вернитесь на главную.
        </p>
      )}
      <ReservationForm
        table={table}
        initialDate={date}
        initialTime={time}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default function ReservePage() {
  return (
    <AuthGuard>
      <Suspense fallback={<p>Загрузка…</p>}>
        <ReserveContent />
      </Suspense>
    </AuthGuard>
  );
}
