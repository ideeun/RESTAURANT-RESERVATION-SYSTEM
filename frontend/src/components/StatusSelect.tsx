"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";
import type { ReservationStatus } from "@/types";

const STATUSES: ReservationStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

const STATUS_DOT: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-emerald-500",
  CANCELLED: "bg-stone-400",
  COMPLETED: "bg-[#c4b5a0]",
};

interface StatusSelectProps {
  value: ReservationStatus;
  onChange: (status: ReservationStatus) => void;
  disabled?: boolean;
}

export default function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold leading-tight transition",
          "hover:opacity-90 disabled:opacity-50",
          open && "ring-2 ring-[#c4b5a0]/40",
          STATUS_STYLES[value]
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {STATUS_LABELS[value]}
        <svg
          className={clsx("h-3 w-3 opacity-70 transition-transform", open && "rotate-180")}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 min-w-[11rem] overflow-hidden rounded-xl border border-[#ebe6dc] bg-white py-1 shadow-lg"
        >
          {STATUSES.map((s) => {
            const active = s === value;
            return (
              <li key={s} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={clsx(
                    "flex w-full items-center px-3.5 py-2.5 text-left text-sm transition",
                    active ? "bg-[#f5f1eb] font-medium text-[#8b7355]" : "text-[#3d3a36] hover:bg-[#faf8f5]"
                  )}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                >
                  <span className={clsx("mr-2.5 h-2 w-2 shrink-0 rounded-full", STATUS_DOT[s])} />
                  {STATUS_LABELS[s]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
