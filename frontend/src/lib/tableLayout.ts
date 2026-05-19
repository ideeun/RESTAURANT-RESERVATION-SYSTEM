/** Размеры и позиции столов на SVG-схеме (viewBox 600×480). */

export const FLOOR_VIEW = { width: 600, height: 480 };

export const ROOM = { x: 48, y: 56, w: 504, h: 368 };

/** Радиус круглого стола от числа мест. */
export function circleRadius(capacity: number): number {
  return Math.min(46, Math.max(22, 14 + capacity * 4));
}

/** Размер прямоугольного стола от числа мест. */
export function rectSize(capacity: number): { width: number; height: number } {
  return {
    width: Math.min(152, 44 + capacity * 12),
    height: Math.min(52, 30 + Math.ceil(capacity / 2) * 5),
  };
}

/** Удерживает центр стола внутри зала. */
export function clampCenter(
  x: number,
  y: number,
  halfW: number,
  halfH: number
): { x: number; y: number } {
  const minX = ROOM.x + halfW;
  const maxX = ROOM.x + ROOM.w - halfW;
  const minY = ROOM.y + halfH;
  const maxY = ROOM.y + ROOM.h - halfH;
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
  };
}

/** Авто-раскладка нового столика в сетке. */
export function nextTablePosition(existingCount: number): { posX: number; posY: number } {
  const cols = 4;
  const col = existingCount % cols;
  const row = Math.floor(existingCount / cols);
  return {
    posX: 130 + col * 115,
    posY: 130 + row * 88,
  };
}

export const TABLE_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Свободен",
  MAINTENANCE: "Недоступен",
  OCCUPIED: "Занят",
};
