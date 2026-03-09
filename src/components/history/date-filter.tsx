"use client";

interface DateFilterProps {
  dates: string[];
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
}

export function DateFilter({ dates, selectedDate, onSelect }: DateFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-5 py-2 rounded-2xl text-sm font-bold transition-all ${
          selectedDate === null
            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "bg-white text-gray-400 border border-gray-100 hover:border-blue-200"
        }`}
      >
        Все
      </button>
      {dates.map((date) => (
        <button
          key={date}
          onClick={() => onSelect(date)}
          className={`flex-shrink-0 px-5 py-2 rounded-2xl text-sm font-bold transition-all ${
            selectedDate === date
              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
              : "bg-white text-gray-400 border border-gray-100 hover:border-blue-200"
          }`}
        >
          {date}
        </button>
      ))}
    </div>
  );
}
