"use client";

interface DateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  minDate?: string;
}

/** Split date/time inputs for reservation search and booking. */
export default function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
}: DateTimePickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-stone-700">Дата</span>
        <input
          type="date"
          className="input-field"
          value={date}
          min={minDate}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-stone-700">Время</span>
        <input
          type="time"
          className="input-field"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          required
        />
      </label>
    </div>
  );
}
