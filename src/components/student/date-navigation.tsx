"use client";

import { Calendar, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
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

  const handleDayStep = (step: number) => {
    if (!selectedDate) return;
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + step);
    onDateChange(toISODate(date));
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
    <div className="flex flex-col gap-3 mb-2 w-full max-w-md mx-auto px-2">
      {/* Верхняя панель: Переведена на чистый Flexbox для идеального выравнивания */}
      <div className="flex items-center justify-between h-11 w-full gap-1 bg-transparent">
        {/* Левая кнопка: Календарь */}
        <button
          type="button"
          onClick={handleIconClick}
          className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-xl transition-colors group"
          aria-label="Открыть календарь"
        >
          <Calendar className="w-4 h-4 text-yellow-500 transition-transform group-hover:scale-110" />
        </button>

        {/* Центральный блок управления: Стрелки + Текст */}
        <div className="flex items-center justify-center flex-1 min-w-0 gap-0.5">
          <button
            type="button"
            onClick={() => handleDayStep(-1)}
            className="p-1.5 flex-shrink-0 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            aria-label="Предыдущий день"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Текст теперь гибкий (flex-1), не ломает верстку и плавно уменьшается */}
          <button
            type="button"
            onClick={handleIconClick}
            className="px-1 py-1.5 hover:bg-slate-50 rounded-xl transition-all min-w-0 max-w-[150px] flex-1"
          >
            <span className="text-xs sm:text-sm font-black text-slate-700 select-none truncate block">
              {formattedSelectedDate}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleDayStep(1)}
            className="p-1.5 flex-shrink-0 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Скрытый инпут */}
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="absolute pointer-events-none opacity-0 w-0 h-0"
          tabIndex={-1}
        />

        {/* Правая кнопка: Текст скрывается на экранах < 360px, оставляя только иконку */}
        <button
          type="button"
          onClick={() => !isToday && onDateChange(todayStr)}
          className={`flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-xl text-[10px] font-black uppercase transition-all ${
            isToday
              ? "bg-slate-50 text-slate-300 pointer-events-none"
              : "bg-yellow-400 text-black hover:bg-yellow-300 shadow-md active:scale-95"
          }`}
        >
          <RotateCcw className="w-3 h-3 flex-shrink-0" />
        </button>
      </div>

      {/* Лента дат: Размеры кружков стали адаптивными (w-9 h-9 на мобильных, w-11 h-11 на экранах побольше) */}
      <div
        className="flex justify-between items-center gap-1 w-full"
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
              className="flex flex-col items-center gap-1 flex-1 min-w-0 group"
              aria-current={isActive ? "date" : undefined}
            >
              <span
                className={`text-[8px] sm:text-[9px] font-black uppercase transition-colors truncate w-full text-center ${
                  isActive ? "text-yellow-500" : "text-slate-400"
                }`}
              >
                {isRealToday ? "Сег" : day.dayName}
              </span>

              <div
                className={`relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full font-black text-xs sm:text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-yellow-400 text-black shadow-md scale-105 sm:scale-110 ring-2 sm:ring-4 ring-yellow-400/10"
                    : "bg-transparent text-slate-600 hover:bg-slate-100"
                }`}
              >
                {day.dayNum}
                {hasData && (
                  <span
                    className={`absolute bottom-0 sm:-bottom-1 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
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
