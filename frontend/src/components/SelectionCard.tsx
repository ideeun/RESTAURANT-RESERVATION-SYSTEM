"use client";

interface SelectionCardProps {
  label: string;
  value: string;
  onClick?: () => void;
  active?: boolean;
}

/** Date/time card from French Touch mockup. */
export default function SelectionCard({ label, value, onClick, active }: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 overflow-hidden rounded-2xl text-left transition ${
        active ? "ring-2 ring-rose-btn ring-offset-2" : ""
      }`}
    >
      <div className="bg-rose-card px-4 py-2 text-center text-sm font-medium text-stone-600">
        {label}
      </div>
      <div className="bg-white px-4 py-5 text-center text-2xl font-bold text-rose-dark">{value}</div>
    </button>
  );
}
