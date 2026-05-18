import clsx from "clsx";
import type { ReservationStatus } from "@/types";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";

interface StatusChipProps {
  status: ReservationStatus;
  className?: string;
}

export default function StatusChip({ status, className }: StatusChipProps) {
  return (
    <span
      className={clsx(
        "inline-flex h-fit max-w-fit shrink-0 items-center self-start whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold leading-tight tracking-wide",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
