/** SVG layout positions — mirrors Tableo-style floor plan (table_number → coords). */

export type TableShape = "circle" | "rect" | "bar-seat";

export interface TableLayout {
  tableNumber: number;
  x: number;
  y: number;
  shape: TableShape;
  /** circle radius or rect width */
  size: number;
  height?: number;
  label?: string;
}

/** Floor plan layout (viewBox 0 0 600 480). */
export const FLOOR_LAYOUT: TableLayout[] = [
  { tableNumber: 1, x: 95, y: 95, shape: "circle", size: 32 },
  { tableNumber: 2, x: 255, y: 130, shape: "circle", size: 36 },
  { tableNumber: 3, x: 355, y: 130, shape: "circle", size: 36 },
  { tableNumber: 4, x: 305, y: 235, shape: "circle", size: 42 },
  { tableNumber: 5, x: 175, y: 365, shape: "rect", size: 200, height: 48 },
  { tableNumber: 6, x: 470, y: 250, shape: "circle", size: 28 },
];

export function getLayout(tableNumber: number): TableLayout | undefined {
  return FLOOR_LAYOUT.find((l) => l.tableNumber === tableNumber);
}
