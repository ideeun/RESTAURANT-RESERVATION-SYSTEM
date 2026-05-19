"use client";

import FloorPlan from "@/components/floor/FloorPlan";
import type { FloorTable } from "@/components/floor/types";
import type { DiningTableFloor } from "@/types";

interface FloorPlanMapProps {
  tables: DiningTableFloor[];
  selectedTableNumber: number | null;
  onSelect: (table: DiningTableFloor) => void;
}

function toFloorTable(t: DiningTableFloor): FloorTable {
  return {
    id: t.id,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    status: t.status,
    posX: t.posX,
    posY: t.posY,
    shape: t.shape,
    available: t.available,
  };
}

export default function FloorPlanMap({ tables, selectedTableNumber, onSelect }: FloorPlanMapProps) {
  const floorTables = tables.map(toFloorTable);

  return (
    <FloorPlan
      tables={floorTables}
      mode="view"
      selectedTableNumber={selectedTableNumber}
      onSelect={(t) => {
        const orig = tables.find((x) => x.id === t.id);
        if (orig) onSelect(orig);
      }}
    />
  );
}
