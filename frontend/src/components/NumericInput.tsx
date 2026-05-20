"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "className"
> & {
  value: number;
  onValueChange: (n: number) => void;
  className?: string;
};

/**
 * Число с нормальным вводом (можно стереть и набрать заново) и классом input-number для стрелок.
 */
export default function NumericInput({ value, onValueChange, min, max, step, className, ...rest }: Props) {
  const [text, setText] = useState(() => String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <input
      type="number"
      inputMode="numeric"
      className={clsx("input-field", "input-number", className)}
      min={min}
      max={max}
      step={step ?? 1}
      value={text}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        if (t === "" || t === "-") return;
        const n = Number(t);
        if (Number.isNaN(n)) return;
        let v = n;
        if (min !== undefined && !Number.isNaN(Number(min))) v = Math.max(Number(min), v);
        if (max !== undefined && !Number.isNaN(Number(max))) v = Math.min(Number(max), v);
        onValueChange(v);
      }}
      onBlur={() => {
        if (text === "" || text === "-" || Number.isNaN(Number(text))) {
          setText(String(value));
          return;
        }
        let n = Number(text);
        if (min !== undefined) n = Math.max(Number(min), n);
        if (max !== undefined) n = Math.min(Number(max), n);
        setText(String(n));
        onValueChange(n);
      }}
      {...rest}
    />
  );
}
