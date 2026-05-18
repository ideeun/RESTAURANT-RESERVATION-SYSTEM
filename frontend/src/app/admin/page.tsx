"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import AuthGuard from "@/components/AuthGuard";
import {
  createTable,
  deleteTable,
  fetchAllBookings,
  fetchAllTables,
  getErrorMessage,
  updateBookingStatus,
  updateTable,
} from "@/lib/api";
import type { DiningTable, Reservation, ReservationStatus } from "@/types";

const STATUSES: ReservationStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
];

function AdminContent() {
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"bookings" | "tables">("bookings");

  const [newTable, setNewTable] = useState({ tableNumber: 7, capacity: 4, status: "AVAILABLE" });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [b, t] = await Promise.all([fetchAllBookings(), fetchAllTables()]);
      setBookings(b);
      setTables(t);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = async (id: number, status: ReservationStatus) => {
    try {
      await updateBookingStatus(id, status);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const addTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTable(newTable);
      setNewTable({ tableNumber: newTable.tableNumber + 1, capacity: 4, status: "AVAILABLE" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
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
    <div>
      <h1 className="font-display text-3xl font-semibold">Панель администратора</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className={tab === "bookings" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("bookings")}
        >
          Бронирования
        </button>
        <button
          type="button"
          className={tab === "tables" ? "btn-primary" : "btn-secondary"}
          onClick={() => setTab("tables")}
        >
          Столики
        </button>
      </div>

      {tab === "bookings" && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-600">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Гость</th>
                <th className="py-2 pr-4">Стол</th>
                <th className="py-2 pr-4">Время</th>
                <th className="py-2 pr-4">Статус</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-stone-100">
                  <td className="py-3 pr-4">{b.id}</td>
                  <td className="py-3 pr-4">{b.username}</td>
                  <td className="py-3 pr-4">№{b.tableNumber}</td>
                  <td className="py-3 pr-4">
                    {format(parseISO(b.reservationTime), "dd.MM.yyyy HH:mm")}
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      className="input-field py-1 text-sm"
                      value={b.status}
                      onChange={(e) =>
                        changeStatus(b.id, e.target.value as ReservationStatus)
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tables" && (
        <div className="mt-6 space-y-6">
          <form onSubmit={addTable} className="card grid gap-4 sm:grid-cols-4">
            <input
              type="number"
              className="input-field"
              placeholder="№ стола"
              value={newTable.tableNumber}
              onChange={(e) =>
                setNewTable({ ...newTable, tableNumber: Number(e.target.value) })
              }
            />
            <input
              type="number"
              className="input-field"
              placeholder="Вместимость"
              value={newTable.capacity}
              onChange={(e) =>
                setNewTable({ ...newTable, capacity: Number(e.target.value) })
              }
            />
            <select
              className="input-field"
              value={newTable.status}
              onChange={(e) => setNewTable({ ...newTable, status: e.target.value })}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="OCCUPIED">OCCUPIED</option>
            </select>
            <button type="submit" className="btn-primary">
              Добавить стол
            </button>
          </form>

          <ul className="space-y-3">
            {tables.map((t) => (
              <li key={t.id} className="card flex flex-wrap items-center justify-between gap-4">
                <span>
                  Стол №{t.tableNumber} · {t.capacity} мест · {t.status}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-sm"
                    onClick={async () => {
                      const capacity = prompt("Вместимость", String(t.capacity));
                      if (!capacity) return;
                      await updateTable(t.id, {
                        tableNumber: t.tableNumber,
                        capacity: Number(capacity),
                        status: t.status,
                      });
                      await load();
                    }}
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                    onClick={async () => {
                      if (confirm("Удалить стол?")) {
                        await deleteTable(t.id);
                        await load();
                      }
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminContent />
    </AuthGuard>
  );
}
