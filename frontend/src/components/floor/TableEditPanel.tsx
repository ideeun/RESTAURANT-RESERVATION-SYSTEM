"use client";

import { useEffect, useState } from "react";
import Select from "@/components/Select";
import NumericInput from "@/components/NumericInput";
import { TABLE_STATUS_LABELS } from "@/lib/tableLayout";
import { getErrorMessage } from "@/lib/api";
import type { DiningTable } from "@/types";

export interface TableEditValues {
  tableNumber: number;
  capacity: number;
  status: string;
  shape: string;
}

interface TableEditPanelProps {
  table: DiningTable;
  onSave: (values: TableEditValues) => Promise<void>;
  onDelete: () => void;
  onClose: () => void;
}

export default function TableEditPanel({ table, onSave, onDelete, onClose }: TableEditPanelProps) {
  const [draft, setDraft] = useState<TableEditValues>({
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    status: table.status,
    shape: table.shape ?? "circle",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      shape: table.shape ?? "circle",
    });
    setError(null);
  }, [table.id, table.tableNumber, table.capacity, table.status, table.shape]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card space-y-3 border-[#c4b5a0] ring-1 ring-[#c4b5a0]/30">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">Редактирование стола</p>
          <p className="text-xs text-[#8a847a]">
            Форма и число мест меняют вид стола и стульев на схеме
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-lg leading-none text-[#8a847a] hover:bg-[#f5f1eb]"
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">№ стола</span>
          <NumericInput min={1} value={draft.tableNumber} onValueChange={(n) => setDraft({ ...draft, tableNumber: n })} />
        </label>
        <label className="block">
          <span className="label">Мест (стульев)</span>
          <NumericInput min={1} max={20} value={draft.capacity} onValueChange={(n) => setDraft({ ...draft, capacity: n })} />
        </label>
        <label className="block">
          <span className="label">Форма</span>
          <Select
            value={draft.shape}
            onChange={(shape) => setDraft({ ...draft, shape })}
            options={[
              { value: "circle", label: "Круглый" },
              { value: "rect", label: "Прямоугольный" },
            ]}
          />
        </label>
        <label className="block">
          <span className="label">Статус</span>
          <Select
            value={draft.status}
            onChange={(status) => setDraft({ ...draft, status })}
            options={[
              { value: "AVAILABLE", label: TABLE_STATUS_LABELS.AVAILABLE },
              { value: "MAINTENANCE", label: TABLE_STATUS_LABELS.MAINTENANCE },
            ]}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={saving} onClick={handleSave} className="btn-primary flex-1">
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
        <button type="button" className="btn-danger" onClick={onDelete}>
          Удалить
        </button>
      </div>
    </div>
  );
}
