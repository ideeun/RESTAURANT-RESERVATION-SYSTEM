"use client";

import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string | number> {
  value: T | "";
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={clsx("h-4 w-4 shrink-0 text-[#8a847a] transition-transform", open && "rotate-180")}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Select<T extends string | number>({
  value,
  onChange,
  options,
  disabled,
  placeholder = "Выберите…",
  className,
  "aria-label": ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const isEmpty = options.length === 0;

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

  const triggerDisabled = disabled || isEmpty;

  return (
    <div ref={rootRef} className={clsx("relative w-full", className)}>
      <button
        type="button"
        disabled={triggerDisabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => !triggerDisabled && setOpen((v) => !v)}
        className={clsx(
          "input-field flex w-full items-center justify-between gap-2 text-left",
          triggerDisabled && "cursor-not-allowed opacity-60",
          open && "border-[#c4b5a0] ring-2 ring-[#c4b5a0]/25"
        )}
      >
        <span className={clsx("min-w-0 truncate", !selected && "text-[#8a847a]")}>
          {selected?.label ?? (isEmpty ? "Нет вариантов" : placeholder)}
        </span>
        <Chevron open={open} />
      </button>

      {open && !isEmpty && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-56 overflow-auto rounded-xl border border-[#ebe6dc] bg-white py-1 shadow-lg"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={String(opt.value)} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={clsx(
                    "flex w-full items-center px-3.5 py-2.5 text-left text-sm transition",
                    active
                      ? "bg-[#f5f1eb] font-medium text-[#8b7355]"
                      : "text-[#3d3a36] hover:bg-[#faf8f5]"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {active && (
                    <svg className="mr-2 h-4 w-4 shrink-0 text-[#8b7355]" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M6.2 11.2 3.4 8.4l.9-.9 1.9 1.9 5.5-5.5.9.9-6.4 6.4z" />
                    </svg>
                  )}
                  <span className={active ? "" : "pl-6"}>{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
