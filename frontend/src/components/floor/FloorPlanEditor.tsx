"use client";

import { useState } from "react";
import clsx from "clsx";
import FloorPlan from "@/components/floor/FloorPlan";
import TableEditPanel, { type TableEditValues } from "@/components/floor/TableEditPanel";
import type { FloorTable } from "@/components/floor/types";
import { createTable, deleteTable, getErrorMessage, updateTable } from "@/lib/api";
import type { DiningTable } from "@/types";

interface FloorPlanEditorProps {
  hallId: number;
  tables: DiningTable[];
  onTablesChange: () => void;
  tableForm: {
    tableNumber: number;
    capacity: number;
    status: string;
    shape: string;
  };
}

function toFloorTable(t: DiningTable): FloorTable {
  return {
    id: t.id,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    status: t.status,
    posX: t.posX ?? 200,
    posY: t.posY ?? 200,
    shape: t.shape ?? "circle",
    available: t.status === "AVAILABLE",
  };
}

export default function FloorPlanEditor({
  hallId,
  tables,
  onTablesChange,
  tableForm,
}: FloorPlanEditorProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [placeMode, setPlaceMode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const floorTables = tables.map(toFloorTable);
  const selected = tables.find((t) => t.id === selectedId);

  const handleMove = async (table: FloorTable, posX: number, posY: number) => {
    const full = tables.find((t) => t.id === table.id);
    if (!full) return;
    setError(null);
    await updateTable(table.id, {
      tableNumber: full.tableNumber,
      capacity: full.capacity,
      status: full.status,
      shape: full.shape ?? "circle",
      posX,
      posY,
    });
    setMessage("Позиция сохранена");
    onTablesChange();
  };

  const handlePlace = async (posX: number, posY: number) => {
    setError(null);
    try {
      await createTable(hallId, { ...tableForm, posX, posY });
      setMessage(`Стол №${tableForm.tableNumber} добавлен`);
      setPlaceMode(false);
      onTablesChange();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const handleSaveEdit = async (values: TableEditValues) => {
    if (!selected) return;
    setError(null);
    await updateTable(selected.id, {
      ...values,
      posX: selected.posX ?? 200,
      posY: selected.posY ?? 200,
    });
    setMessage(`Стол №${values.tableNumber} обновлён`);
    onTablesChange();
  };

  const handleDeleteSelected = async () => {
    if (!selected || !confirm(`Удалить стол №${selected.tableNumber}?`)) return;
    try {
      await deleteTable(selected.id);
      setSelectedId(null);
      setMessage(null);
      onTablesChange();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={clsx("chip", placeMode ? "chip-active" : "chip-inactive")}
          onClick={() => {
            setPlaceMode((v) => !v);
            setSelectedId(null);
            setMessage(placeMode ? null : "Кликните на схему для нового стола");
          }}
        >
          {placeMode ? "Отмена" : "+ Поставить стол"}
        </button>
      </div>

      {message && <p className="text-xs text-[#8b7355]">{message}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <FloorPlan
        tables={floorTables}
        mode="edit"
        selectedTableId={selectedId}
        placeMode={placeMode}
        onSelect={(t) => {
          setSelectedId(t.id);
          setPlaceMode(false);
          setMessage(null);
          setError(null);
        }}
        onMoveTable={handleMove}
        onPlaceTable={handlePlace}
      />

      {selected && !placeMode && (
        <TableEditPanel
          table={selected}
          onSave={handleSaveEdit}
          onDelete={handleDeleteSelected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
