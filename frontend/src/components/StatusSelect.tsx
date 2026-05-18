"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";
import type { ReservationStatus } from "@/types";

const STATUSES: ReservationStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

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
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition",
          "hover:opacity-90 disabled:opacity-50",
          STATUS_STYLES[value]
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {STATUS_LABELS[value]}
        <svg className="h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 min-w-[10.5rem] overflow-hidden rounded-xl border border-[#ebe6dc] bg-white py-1 shadow-lg"
        >
          {STATUSES.map((s) => (
            <li key={s} role="option" aria-selected={s === value}>
              <button
                type="button"
                className={clsx(
                  "flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-[#f5f1eb]",
                  s === value ? "font-medium text-[#8b7355]" : "text-[#3d3a36]"
                )}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                <span
                  className={clsx(
                    "mr-2 inline-block h-2 w-2 rounded-full",
                    s === "PENDING" && "bg-amber-400",
                    s === "CONFIRMED" && "bg-emerald-500",
                    s === "CANCELLED" && "bg-stone-400",
                    s === "COMPLETED" && "bg-[#c4b5a0]"
                  )}
                />
                {STATUS_LABELS[s]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
