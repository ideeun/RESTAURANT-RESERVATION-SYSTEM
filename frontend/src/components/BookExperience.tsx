"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { ru } from "date-fns/locale/ru";
import clsx from "clsx";
import FloorPlanMap from "@/components/FloorPlanMap";
import BookingModal from "@/components/BookingModal";
import DateTimePicker from "@/components/DateTimePicker";
import {
  createReservation,
  fetchBranches,
  fetchFloorTables,
  fetchHalls,
} from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { defaultSearchDate, defaultSearchTime, toApiDateTime } from "@/lib/datetime";
import type { Branch, DiningTableFloor, Hall } from "@/types";

const TIME_SLOTS = ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "20:30", "21:00"];

export default function BookExperience() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [hallId, setHallId] = useState<number | null>(null);
  const [date, setDate] = useState(defaultSearchDate());
  const [time, setTime] = useState(defaultSearchTime());
  const [duration, setDuration] = useState(90);
  const [guestCount, setGuestCount] = useState(2);
  const [tables, setTables] = useState<DiningTableFloor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<DiningTableFloor | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches()
      .then((b) => {
        setBranches(b);
        setApiError(null);
        if (b.length > 0) setBranchId(b[0].id);
      })
      .catch(() => setApiError("Не удалось подключиться к серверу. Запустите backend на порту 8080."));
  }, []);

  useEffect(() => {
    if (!branchId) return;
    fetchHalls(branchId).then((h) => {
      setHalls(h);
      setHallId(h.length > 0 ? h[0].id : null);
    });
  }, [branchId]);

  const loadFloor = useCallback(async () => {
    if (!hallId) return;
    setLoading(true);
    try {
      const data = await fetchFloorTables(hallId, toApiDateTime(date, time), duration, guestCount);
      setTables(data);
    } catch {
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [hallId, date, time, duration, guestCount]);

  useEffect(() => {
    loadFloor();
  }, [loadFloor]);

  const monthLabel = format(parse(date, "yyyy-MM-dd", new Date()), "LLLL", { locale: ru });
  const dayLabel = format(parse(date, "yyyy-MM-dd", new Date()), "d");
  const branch = branches.find((b) => b.id === branchId);

  const handleBook = async (guests: number) => {
    if (!selected) return;
    if (!isAuthenticated()) {
      router.push("/login?next=/book");
      return;
    }
    await createReservation({
      tableId: selected.id,
      reservationTime: toApiDateTime(date, time),
      duration,
      guestCount: guests,
    });
    setSelected(null);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-5 pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Бронирование</h1>
        <p className="mt-1 text-sm text-[#8a847a]">Филиал → зал → стол на схеме</p>
      </div>

      {apiError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {apiError}
        </div>
      )}

      <div className="card space-y-4">
        <div>
          <label className="label">Филиал</label>
          <select className="input-field" value={branchId ?? ""} onChange={(e) => setBranchId(Number(e.target.value))}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {branch?.address && <p className="mt-1 text-xs text-[#8a847a]">{branch.address}</p>}
        </div>

        <div>
          <label className="label">Зал</label>
          <select
            className="input-field"
            value={hallId ?? ""}
            onChange={(e) => setHallId(Number(e.target.value))}
            disabled={!halls.length}
          >
            {halls.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="card-soft text-left" onClick={() => setShowPicker(!showPicker)}>
            <p className="text-xs text-[#8a847a]">{monthLabel}</p>
            <p className="text-2xl font-semibold">{dayLabel}</p>
          </button>
          <button type="button" className="card-soft text-left" onClick={() => setShowPicker(!showPicker)}>
            <p className="text-xs text-[#8a847a]">Время</p>
            <p className="text-2xl font-semibold">{time}</p>
          </button>
        </div>

        {showPicker && (
          <div className="space-y-3 border-t border-[#ebe6dc] pt-4">
            <DateTimePicker date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={clsx("chip", time === slot ? "chip-active" : "chip-inactive")}
                >
                  {slot}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="label">Длительность</span>
                <input type="number" min={30} className="input-field" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
              </label>
              <label>
                <span className="label">Гостей</span>
                <input type="number" min={1} className="input-field" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} />
              </label>
            </div>
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#8a847a]">Схема зала</h2>
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border border-[#ebe6dc] bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c4b5a0] border-t-[#8b7355]" />
          </div>
        ) : hallId ? (
          <FloorPlanMap tables={tables} selectedTableNumber={selected?.tableNumber ?? null} onSelect={setSelected} />
        ) : (
          <p className="card text-sm text-[#8a847a]">Сначала выберите зал</p>
        )}
      </section>

      {selected && (
        <BookingModal table={selected} guestCount={guestCount} onClose={() => setSelected(null)} onConfirm={handleBook} />
      )}
    </div>
  );
}
