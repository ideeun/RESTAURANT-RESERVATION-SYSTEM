"use client";

import { useEffect } from "react";

export type AdminModalVariant = "confirm" | "alert";

export interface AdminConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  variant?: AdminModalVariant;
  /** Только для variant === "confirm" */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Красная кнопка подтверждения (удаление) */
  danger?: boolean;
  onClose: () => void;
  /** Для confirm — вызывается по нажатию основной кнопки */
  onConfirm?: () => void | Promise<void>;
}

export default function AdminConfirmModal({
  open,
  title,
  message,
  variant = "confirm",
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  danger = false,
  onClose,
  onConfirm,
}: AdminConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handlePrimary = async () => {
    if (variant === "alert") {
      onClose();
      return;
    }
    onClose();
    await onConfirm?.();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#2c2820]/45 backdrop-blur-[3px]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        aria-describedby="admin-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card border-[#e5ddd0] shadow-xl ring-1 ring-black/5">
          <div className="mb-1 flex items-start gap-3">
            <div
              className={
                danger && variant === "confirm"
                  ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg"
                  : variant === "alert"
                    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg"
                    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0ebe3] text-lg"
              }
            >
              {variant === "alert" ? "⚠️" : danger ? "🗑" : "❔"}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="admin-modal-title" className="text-lg font-semibold leading-snug text-[#3d3a36]">
                {title}
              </h2>
              <p id="admin-modal-desc" className="mt-2 text-sm leading-relaxed text-[#5c574f]">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {variant === "confirm" && (
              <button type="button" className="btn-secondary sm:min-w-[7rem]" onClick={onClose}>
                {cancelLabel}
              </button>
            )}
            <button
              type="button"
              className={
                variant === "alert"
                  ? "btn-primary sm:min-w-[7rem]"
                  : danger
                    ? "rounded-xl bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 sm:min-w-[7rem]"
                    : "btn-primary sm:min-w-[7rem]"
              }
              onClick={() => void handlePrimary()}
            >
              {variant === "alert" ? "Понятно" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
