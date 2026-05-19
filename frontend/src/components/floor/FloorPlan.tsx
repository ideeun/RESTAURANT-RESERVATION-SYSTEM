"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { circleChairs, rectChairs, type ChairPoint } from "@/lib/chairs";
import { circleRadius, clampCenter, FLOOR_VIEW, rectSize, ROOM } from "@/lib/tableLayout";
import type { FloorTable } from "./types";

type Mode = "view" | "edit";

interface FloorPlanProps {
  tables: FloorTable[];
  mode?: Mode;
  selectedTableId?: number | null;
  selectedTableNumber?: number | null;
  onSelect?: (table: FloorTable) => void;
  onMoveTable?: (table: FloorTable, posX: number, posY: number) => void | Promise<void>;
  onPlaceTable?: (posX: number, posY: number) => void;
  placeMode?: boolean;
}

function tableFill(table: FloorTable, selected: boolean, mode: Mode): string {
  if (selected) return "#7a6549";
  if (table.status === "MAINTENANCE") return "#b8b4ac";
  if (mode === "view" && table.available === false) return "#c9a882";
  if (table.status === "AVAILABLE" || table.available !== false) return "#8eb4c9";
  return "#c9a882";
}

function Chair({ point }: { point: ChairPoint }) {
  return (
    <rect
      x={point.x - 5}
      y={point.y - 3.5}
      width={10}
      height={7}
      rx={2}
      fill="#d8cfc0"
      stroke="#b8a99a"
      strokeWidth={0.6}
      transform={`rotate(${point.angle}, ${point.x}, ${point.y})`}
      pointerEvents="none"
    />
  );
}

function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const matrix = svg.getScreenCTM()?.inverse();
  return matrix ? pt.matrixTransform(matrix) : { x: 0, y: 0 };
}

export default function FloorPlan({
  tables,
  mode = "view",
  selectedTableId,
  selectedTableNumber,
  onSelect,
  onMoveTable,
  onPlaceTable,
  placeMode = false,
}: FloorPlanProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const suppressClickRef = useRef(false);
  const dragMovedRef = useRef(false);
  const [drag, setDrag] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [draftPos, setDraftPos] = useState<Record<number, { x: number; y: number }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const getPos = useCallback(
    (t: FloorTable) => draftPos[t.id] ?? { x: t.posX, y: t.posY },
    [draftPos]
  );

  const endDrag = useCallback(
    async (table: FloorTable, x: number, y: number) => {
      if (!onMoveTable) return;
      setSavingId(table.id);
      try {
        await onMoveTable(table, Math.round(x), Math.round(y));
        setDraftPos((d) => {
          const next = { ...d };
          delete next[table.id];
          return next;
        });
      } catch {
        setDraftPos((d) => {
          const next = { ...d };
          delete next[table.id];
          return next;
        });
      } finally {
        setSavingId(null);
      }
    },
    [onMoveTable]
  );

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const table = tables.find((t) => t.id === drag.id);
      if (!table) return;

      const { x, y } = clientToSvg(svg, e.clientX, e.clientY);
      const isRect = table.shape === "rect";
      const halfW = isRect ? rectSize(table.capacity).width / 2 : circleRadius(table.capacity);
      const halfH = isRect ? rectSize(table.capacity).height / 2 : circleRadius(table.capacity);
      const clamped = clampCenter(x - drag.offsetX, y - drag.offsetY, halfW, halfH);

      dragMovedRef.current = true;
      setDraftPos((d) => ({ ...d, [table.id]: clamped }));
    };

    const onUp = (e: PointerEvent) => {
      const svg = svgRef.current;
      const table = tables.find((t) => t.id === drag.id);
      if (svg && table) {
        const { x, y } = clientToSvg(svg, e.clientX, e.clientY);
        const isRect = table.shape === "rect";
        const halfW = isRect ? rectSize(table.capacity).width / 2 : circleRadius(table.capacity);
        const halfH = isRect ? rectSize(table.capacity).height / 2 : circleRadius(table.capacity);
        const clamped = clampCenter(x - drag.offsetX, y - drag.offsetY, halfW, halfH);
        if (dragMovedRef.current) {
          suppressClickRef.current = true;
          void endDrag(table, clamped.x, clamped.y);
        }
      }
      setDrag(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, tables, endDrag]);

  const handleTableClick = (table: FloorTable, canBook: boolean) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (mode === "view" && canBook) onSelect?.(table);
    if (mode === "edit") onSelect?.(table);
  };

  const handleFloorClick = (e: React.MouseEvent<SVGRectElement>) => {
    if (mode !== "edit" || !placeMode || !onPlaceTable || !svgRef.current) return;
    const { x, y } = clientToSvg(svgRef.current, e.clientX, e.clientY);
    const clamped = clampCenter(x, y, 28, 28);
    onPlaceTable(Math.round(clamped.x), Math.round(clamped.y));
  };

  const renderTable = (table: FloorTable) => {
    const raw = getPos(table);
    const selected =
      selectedTableId === table.id || selectedTableNumber === table.tableNumber;
    const fill = tableFill(table, selected, mode);
    const canBook = mode === "view" && table.available && table.status !== "MAINTENANCE";
    const isRect = table.shape === "rect";
    const isDragging = drag?.id === table.id;
    const isSaving = savingId === table.id;

    let chairs: ChairPoint[] = [];
    let cx: number;
    let cy: number;

    if (isRect) {
      const { width: w, height: h } = rectSize(table.capacity);
      const c = clampCenter(raw.x, raw.y, w / 2, h / 2);
      cx = c.x;
      cy = c.y;
      chairs = rectChairs(cx, cy, w, h, table.capacity);

      return (
        <g
          key={table.id}
          filter="url(#table-shadow)"
          style={{
            opacity: isSaving ? 0.7 : mode === "view" && !canBook ? 0.55 : 1,
            cursor: mode === "edit" ? (isDragging ? "grabbing" : "grab") : canBook ? "pointer" : "not-allowed",
          }}
          onPointerDown={(e) => {
            if (mode !== "edit") {
              if (canBook) onSelect?.(table);
              return;
            }
            e.stopPropagation();
            const svg = svgRef.current;
            if (!svg) return;
            const pt = clientToSvg(svg, e.clientX, e.clientY);
            dragMovedRef.current = false;
            setDrag({ id: table.id, offsetX: pt.x - cx, offsetY: pt.y - cy });
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleTableClick(table, canBook);
          }}
        >
          {chairs.map((ch, i) => (
            <Chair key={i} point={ch} />
          ))}
          <rect
            x={cx - w / 2}
            y={cy - h / 2}
            width={w}
            height={h}
            rx={10}
            fill={fill}
            stroke={selected ? "#fff" : "rgba(255,255,255,0.4)"}
            strokeWidth={selected ? 3 : 1.5}
          />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize={12}
            fontWeight="600"
            pointerEvents="none"
          >
            {table.tableNumber}
          </text>
        </g>
      );
    }

    const r = circleRadius(table.capacity);
    const c = clampCenter(raw.x, raw.y, r, r);
    cx = c.x;
    cy = c.y;
    chairs = circleChairs(cx, cy, r, table.capacity);

    return (
      <g
        key={table.id}
        filter="url(#table-shadow)"
        style={{
          opacity: isSaving ? 0.7 : mode === "view" && !canBook ? 0.55 : 1,
          cursor: mode === "edit" ? (isDragging ? "grabbing" : "grab") : canBook ? "pointer" : "not-allowed",
        }}
        onPointerDown={(e) => {
          if (mode !== "edit") {
            if (canBook) onSelect?.(table);
            return;
          }
          e.stopPropagation();
          const svg = svgRef.current;
          if (!svg) return;
          const pt = clientToSvg(svg, e.clientX, e.clientY);
          dragMovedRef.current = false;
          setDrag({ id: table.id, offsetX: pt.x - cx, offsetY: pt.y - cy });
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleTableClick(table, canBook);
        }}
      >
        {chairs.map((ch, i) => (
          <Chair key={i} point={ch} />
        ))}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={fill}
          stroke={selected ? "#fff" : "rgba(255,255,255,0.4)"}
          strokeWidth={selected ? 3 : 1.5}
        />
        <text
          x={cx}
          y={cy - (table.capacity > 4 ? 4 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={r > 28 ? 13 : 11}
          fontWeight="600"
          pointerEvents="none"
        >
          {table.tableNumber}
        </text>
      </g>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#ebe6dc] bg-[#faf8f5] shadow-sm">
      {mode === "edit" && (
        <div className="border-b border-[#ebe6dc] bg-white px-3 py-2 text-xs text-[#8a847a]">
          {placeMode
            ? "Нажмите на схему, чтобы поставить новый стол"
            : "Перетащите стол · клик — выбрать"}
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${FLOOR_VIEW.width} ${FLOOR_VIEW.height}`}
        className={clsx(
          "h-auto w-full max-h-[min(72vh,520px)] touch-none",
          placeMode && mode === "edit" && "cursor-crosshair"
        )}
        aria-label={mode === "edit" ? "Редактор схемы зала" : "Схема зала"}
      >
        <defs>
          <filter id="table-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>

        <rect
          x={ROOM.x - 16}
          y={ROOM.y - 16}
          width={ROOM.w + 32}
          height={ROOM.h + 32}
          rx={16}
          fill="#f3efe8"
          stroke="#e0d8cc"
          strokeWidth={1.5}
          onClick={handleFloorClick}
          className={placeMode ? "cursor-crosshair" : undefined}
        />
        <circle cx={300} cy={200} r={20} fill="#dce8dc" stroke="#c5d8c5" strokeWidth={1} pointerEvents="none" />
        <text x={300} y={205} textAnchor="middle" fontSize={14} fill="#6b8f6b" pointerEvents="none">
          🌿
        </text>

        {tables.map(renderTable)}
      </svg>

      <div className="flex flex-wrap justify-center gap-4 border-t border-[#ebe6dc] bg-white px-4 py-2.5 text-xs text-[#8a847a]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#8eb4c9]" /> Свободен
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#c9a882]" /> Занят
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#b8b4ac]" /> Недоступен
        </span>
        {mode === "edit" && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-[#d8cfc0] ring-1 ring-[#b8a99a]" /> Стул
          </span>
        )}
      </div>
    </div>
  );
}
