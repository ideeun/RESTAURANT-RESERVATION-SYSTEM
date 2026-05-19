/** Позиции стульев вокруг стола (viewBox-координаты). */

export interface ChairPoint {
  x: number;
  y: number;
  angle: number;
}

/** Стулья по кругу вокруг круглого стола. */
export function circleChairs(cx: number, cy: number, tableR: number, count: number): ChairPoint[] {
  if (count <= 0) return [];
  const seatR = tableR + 11;
  return Array.from({ length: count }, (_, i) => {
    const a = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: cx + Math.cos(a) * seatR,
      y: cy + Math.sin(a) * seatR,
      angle: (a * 180) / Math.PI + 90,
    };
  });
}

/** Стулья вдоль длинных сторон прямоугольного стола. */
export function rectChairs(
  cx: number,
  cy: number,
  width: number,
  height: number,
  count: number
): ChairPoint[] {
  if (count <= 0) return [];
  const chairs: ChairPoint[] = [];
  const pad = 14;
  const top = Math.ceil(count / 2);
  const bottom = count - top;

  for (let i = 0; i < top; i++) {
    const t = top === 1 ? 0.5 : (i + 1) / (top + 1);
    chairs.push({
      x: cx - width / 2 + width * t,
      y: cy - height / 2 - pad,
      angle: 0,
    });
  }
  for (let i = 0; i < bottom; i++) {
    const t = bottom === 1 ? 0.5 : (i + 1) / (bottom + 1);
    chairs.push({
      x: cx - width / 2 + width * t,
      y: cy + height / 2 + pad,
      angle: 180,
    });
  }
  return chairs;
}
