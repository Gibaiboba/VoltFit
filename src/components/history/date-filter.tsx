"use client";

import { Check, Calendar as CalendarIcon } from "lucide-react";
import { SavedMeal } from "@/types/food";
import { toISODate } from "@/lib/utils/date-utils";
import { useRef } from "react";

interface DateFilterProps {
  days: Date[];
  meals: SavedMeal[];
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
}

export function DateFilter({
  days,
  meals,
  selectedDate,
  onSelect,
}: DateFilterProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleCalendarClick = () => {
    // Метод showPicker() открывает календарь программно
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const hasData = (isoDate: string) => {
    return meals.some(
      (meal) => toISODate(new Date(meal.created_at)) === isoDate,
    );
  };

  return (
    <div className="flex gap-3 items-center overflow-x-auto pb-6 mb-6 no-scrollbar pt-2 px-1">
      {/* Кнопка календаря */}
      <div className="relative flex-shrink-0 ">
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate || ""}
          onChange={(e) => onSelect(e.target.value || null)}
          className="absolute opacity-0 pointer-events-none"
        />
        <button
          onClick={handleCalendarClick}
          className={`flex flex-col items-center cursor-pointer justify-center w-14 h-20 rounded-2xl transition-all border ${
            selectedDate && !days.some((d) => toISODate(d) === selectedDate)
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200 border-transparent"
              : "bg-white text-gray-400 border-gray-100"
          }`}
        >
          <CalendarIcon size={20} />
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">
            Дата
          </span>
        </button>
      </div>

      <div className="w-[1px] h-12 bg-gray-100 flex-shrink-0 mx-1" />

      {/* Кнопка "Все" */}
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 flex flex-col items-center cursor-pointer justify-center min-w-[56px] h-20 rounded-2xl text-[10px] font-black uppercase transition-all border ${
          selectedDate === null
            ? "bg-blue-600 text-white border-transparent"
            : "bg-white text-gray-400 border-gray-100"
        }`}
      >
        Все
      </button>

      {/* Генерация дней */}
      {days.map((date) => {
        const iso = toISODate(date);
        const isSelected = selectedDate === iso;
        const logged = hasData(iso);

        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            className={`relative flex-shrink-0 cursor-pointer flex flex-col items-center justify-center w-14 h-20 rounded-2xl transition-all border ${
              isSelected
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-gray-500 border-gray-100"
            }`}
          >
            <span
              className={`text-[10px] uppercase font-black mb-1 ${isSelected ? "text-blue-100" : "text-gray-400"}`}
            >
              {date.toLocaleDateString("ru-RU", { weekday: "short" })}
            </span>
            <span className="text-lg font-black leading-none">
              {date.getDate()}
            </span>
            {logged && (
              <div
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                  isSelected
                    ? "bg-white text-blue-600 border-blue-600"
                    : "bg-green-500 text-white border-white"
                }`}
              >
                <Check size={10} strokeWidth={4} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
