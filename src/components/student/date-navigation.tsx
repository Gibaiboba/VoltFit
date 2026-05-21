"use client";

import { Calendar, RotateCcw } from "lucide-react";
import { useMemo, useRef } from "react";
import { toISODate } from "@/lib/utils/date-utils";

interface DateNavigationProps {
  selectedDate: string;
  isToday: boolean;
  todayStr: string;
  onDateChange: (date: string) => void;
  daysWithData?: string[];
}

export function DateNavigation({
  selectedDate,
  isToday,
  todayStr,
  onDateChange,
  daysWithData = [],
}: DateNavigationProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (err) {
        console.warn("Вызов календаря не удался:", err);
        dateInputRef.current.focus();
      }
    }
  };

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";

    const date = new Date(selectedDate);
    const isSelectedToday = selectedDate === todayStr;

    const weekdayOrToday = isSelectedToday
      ? "Сегодня"
      : date.toLocaleDateString("ru-RU", { weekday: "long" });

    const capitalizedWeekday =
      weekdayOrToday.charAt(0).toUpperCase() + weekdayOrToday.slice(1);

    const dayAndMonth = date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
    });

    return `${capitalizedWeekday}, ${dayAndMonth}`;
  }, [selectedDate, todayStr]);

  const historyDays = useMemo(() => {
    const days = [];
    const baseDate = new Date(todayStr);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);

      const isoString = toISODate(date);

      days.push({
        full: isoString,
        dayName: date.toLocaleDateString("ru-RU", { weekday: "short" }),
        dayNum: date.getDate(),
      });
    }
    return days;
  }, [todayStr]);

  return (
    <div className="flex flex-col gap-6 mb-8 w-full max-w-md mx-auto">
      {/* Относительный контейнер, высота фиксирована для стабильности (h-11) */}
      <div className="relative flex items-center h-11 px-2 rounded-2xl bg-transparent">
        {/* Иконка жестко привязана к левому краю */}
        <button
          type="button"
          onClick={handleIconClick}
          className="absolute left-2 z-10 p-2 hover:bg-slate-100 rounded-xl transition-colors group"
          aria-label="Открыть календарь"
        >
          <Calendar className="w-4 h-4 text-yellow-500 transition-transform group-hover:scale-110" />
        </button>

        {/* Интерактивная текстовая зона по центру экрана. 
            Ширина ограничена (max-w-[180px]), чтобы текст не налезал на кнопку "Назад" */}
        <button
          type="button"
          onClick={handleIconClick}
          className="absolute left-1/2 -translate-x-1/2 w-full max-w-[180px] text-center py-1.5 hover:bg-slate-50 rounded-xl transition-all group"
        >
          <span className="text-sm font-black text-slate-700 select-none truncate block">
            {formattedSelectedDate}
          </span>
        </button>

        {/* Полностью изолированный скрытый инпут */}
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="absolute pointer-events-none opacity-0 w-0 h-0"
          tabIndex={-1}
        />

        {/* Кнопка LIVE/Назад жестко привязана к правому краю */}
        <button
          type="button"
          onClick={() => !isToday && onDateChange(todayStr)}
          className={`absolute right-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
            isToday
              ? "bg-slate-50 text-slate-300 pointer-events-none"
              : "bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg active:scale-95"
          }`}
        >
          {isToday ? (
            <RotateCcw className="w-3 h-3" />
          ) : (
            <>
              <RotateCcw className="w-3 h-3" />{" "}
            </>
          )}
        </button>
      </div>

      {/* Лента дат */}
      <div
        className="flex justify-between items-center gap-1"
        role="group"
        aria-label="Выбор даты"
      >
        {historyDays.map((day) => {
          const isActive = day.full === selectedDate;
          const hasData = daysWithData.includes(day.full);
          const isRealToday = day.full === todayStr;

          return (
            <button
              key={day.full}
              type="button"
              onClick={() => onDateChange(day.full)}
              className="flex flex-col items-center gap-2 flex-1 group"
              aria-current={isActive ? "date" : undefined}
            >
              <span
                className={`text-[9px] font-black uppercase transition-colors ${
                  isActive ? "text-yellow-500" : "text-slate-400"
                }`}
              >
                {isRealToday ? "Сегодня" : day.dayName}
              </span>

              <div
                className={`relative flex items-center justify-center w-11 h-11 rounded-full font-black text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-yellow-400 text-black shadow-lg scale-110 ring-4 ring-yellow-400/10"
                    : "bg-transparent text-slate-600 hover:bg-slate-100"
                }`}
              >
                {day.dayNum}
                {hasData && (
                  <span
                    className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-black" : "bg-green-500"
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
