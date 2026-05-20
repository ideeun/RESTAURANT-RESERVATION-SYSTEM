import clsx from "clsx";
import type { ReservationStatus } from "@/types";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";

interface StatusChipProps {
  status: ReservationStatus | string | undefined;
  className?: string;
}

const KNOWN: ReservationStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

function isReservationStatus(s: string | undefined): s is ReservationStatus {
  return s !== undefined && (KNOWN as string[]).includes(s);
}

export default function StatusChip({ status, className }: StatusChipProps) {
  const label =
    status && isReservationStatus(status) ? STATUS_LABELS[status] : status || "—";
  const style =
    status && isReservationStatus(status) ? STATUS_STYLES[status] : "bg-stone-100 text-stone-600";
  return (
    <span
      className={clsx(
        "inline-flex h-fit max-w-fit shrink-0 items-center self-start whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold leading-tight tracking-wide",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
