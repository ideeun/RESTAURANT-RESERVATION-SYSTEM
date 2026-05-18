import type { ReservationStatus } from "@/types";

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Ожидает",
  CONFIRMED: "Подтверждена",
  CANCELLED: "Отменена",
  COMPLETED: "Завершена",
};

export const STATUS_STYLES: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-stone-200 text-stone-700",
  COMPLETED: "bg-[#ebe6dc] text-[#5c574f]",
};
