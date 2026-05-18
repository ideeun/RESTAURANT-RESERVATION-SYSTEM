"use client";

import clsx from "clsx";
import { circleRadius, clampCenter, rectSize } from "@/lib/tableLayout";
import type { DiningTableFloor } from "@/types";

interface FloorPlanMapProps {
  tables: DiningTableFloor[];
  selectedTableNumber: number | null;
  onSelect: (table: DiningTableFloor) => void;
}

function fillColor(table: DiningTableFloor, selected: boolean): string {
  if (selected) return "#7a6549";
  if (table.status === "MAINTENANCE") return "#b8b4ac";
  if (table.available) return "#8eb4c9";
  return "#c9a882";
}

export default function FloorPlanMap({ tables, selectedTableNumber, onSelect }: FloorPlanMapProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#ebe6dc] bg-[#faf8f5] shadow-sm">
      <svg
        viewBox="0 0 600 480"
        className="h-auto w-full max-h-[min(72vh,520px)]"
        aria-label="Схема зала"
      >
        <defs>
          <filter id="table-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>

        <rect x="32" y="40" width="536" height="400" rx="16" fill="#f3efe8" stroke="#e0d8cc" strokeWidth="1.5" />
        <circle cx="300" cy="200" r="20" fill="#dce8dc" stroke="#c5d8c5" strokeWidth="1" />
        <text x="300" y="205" textAnchor="middle" fontSize="14" fill="#6b8f6b" pointerEvents="none">
          🌿
        </text>

        {tables.map((table) => {
          const selected = selectedTableNumber === table.tableNumber;
          const fill = fillColor(table, selected);
          const canClick = table.available && table.status !== "MAINTENANCE";
          const isRect = table.shape === "rect";

          if (isRect) {
            const { width: w, height: h } = rectSize(table.capacity);
            const { x: cx, y: cy } = clampCenter(table.posX, table.posY, w / 2, h / 2);
            const fontSize = w > 90 ? 13 : 12;

            return (
              <g
                key={table.id}
                filter="url(#table-shadow)"
                onClick={() => canClick && onSelect(table)}
                className={clsx("transition-opacity", canClick ? "cursor-pointer" : "cursor-not-allowed")}
                style={{ opacity: canClick ? 1 : 0.55 }}
              >
                <rect
                  x={cx - w / 2}
                  y={cy - h / 2}
                  width={w}
                  height={h}
                  rx={10}
                  fill={fill}
                  stroke={selected ? "#fff" : "rgba(255,255,255,0.35)"}
                  strokeWidth={selected ? 3 : 1.5}
                />
                <text
                  x={cx}
                  y={cy + (table.capacity > 6 ? 0 : 1)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={fontSize}
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {table.tableNumber}
                </text>
                {table.capacity > 6 && (
                  <text
                    x={cx}
                    y={cy + 14}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.92)"
                    fontSize="9"
                    pointerEvents="none"
                  >
                    {table.capacity} мест
                  </text>
                )}
              </g>
            );
          }

          const r = circleRadius(table.capacity);
          const { x: cx, y: cy } = clampCenter(table.posX, table.posY, r, r);
          const showSeats = r >= 28;

          return (
            <g
              key={table.id}
              filter="url(#table-shadow)"
              onClick={() => canClick && onSelect(table)}
              className={clsx("transition-opacity", canClick ? "cursor-pointer" : "cursor-not-allowed")}
              style={{ opacity: canClick ? 1 : 0.55 }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke={selected ? "#fff" : "rgba(255,255,255,0.35)"}
                strokeWidth={selected ? 3 : 1.5}
              />
              <text
                x={cx}
                y={cy + (showSeats ? -5 : 1)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={r > 30 ? 14 : 12}
                fontWeight="600"
                pointerEvents="none"
              >
                {table.tableNumber}
              </text>
              {showSeats && (
                <text
                  x={cx}
                  y={cy + 12}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.92)"
                  fontSize="9"
                  pointerEvents="none"
                >
                  {table.capacity} мест
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap justify-center gap-4 border-t border-[#ebe6dc] bg-white px-4 py-2.5 text-xs text-[#8a847a]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#8eb4c9] ring-1 ring-[#7aa3b8]/30" /> Свободен
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#c9a882] ring-1 ring-[#b89870]/30" /> Занят
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#b8b4ac] ring-1 ring-[#a8a49c]/30" /> Недоступен
        </span>
      </div>
    </div>
  );
}
