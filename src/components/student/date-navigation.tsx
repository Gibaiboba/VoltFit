"use client";

import { Calendar, RotateCcw } from "lucide-react";
import { useMemo, useRef } from "react";

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

  // Генерируем 7 дней статично от сегодняшней даты
  const historyDays = useMemo(() => {
    const days = [];
    const baseDate = new Date(todayStr);
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() - i);
      days.push({
        full: date.toISOString().split("T")[0],
        dayName: date.toLocaleDateString("ru-RU", { weekday: "short" }),
        dayNum: date.getDate(),
      });
    }
    return days;
  }, [todayStr]);

  return (
    <div className="flex flex-col gap-6 mb-8 w-full max-w-md mx-auto">
      {/* Верхняя панель: анимация срабатывает при любой смене даты */}
      <div
        key={`panel-${selectedDate}`}
        className="flex justify-between items-center bg-white p-2 pl-5 rounded-2xl border border-slate-100 shadow-sm 
                   animate-[charge_0.5s_ease-in-out]"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleIconClick}
            className="p-1 hover:bg-yellow-50 rounded-lg transition-colors group"
          >
            <Calendar className="w-4 h-4 text-yellow-500 transition-transform group-hover:scale-110" />
          </button>

          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-sm font-black text-slate-700 outline-none cursor-pointer 
                       appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
          />
        </div>

        <button
          onClick={() => !isToday && onDateChange(todayStr)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
            isToday
              ? "bg-slate-50 text-slate-300 pointer-events-none"
              : "bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg active:scale-95"
          }`}
        >
          {isToday ? (
            "● LIVE"
          ) : (
            <>
              <RotateCcw className="w-3 h-3" /> Назад
            </>
          )}
        </button>
      </div>

      {/* Лента дат: теперь статичная, меняется только активное состояние */}
      <div className="flex justify-between items-center gap-1">
        {historyDays.map((day) => {
          const isActive = day.full === selectedDate;
          const hasData = daysWithData.includes(day.full);
          const isRealToday = day.full === todayStr;

          return (
            <button
              key={day.full}
              onClick={() => onDateChange(day.full)}
              className="flex flex-col items-center gap-2 flex-1 group"
            >
              <span
                className={`text-[9px] font-black uppercase transition-colors ${
                  isActive ? "text-yellow-500" : "text-slate-400"
                }`}
              >
                {isRealToday ? "Сегодня" : day.dayName}
              </span>

              <div
                className={`
                  relative flex items-center justify-center w-11 h-11 rounded-full font-black text-sm transition-all duration-300
                  ${
                    isActive
                      ? "bg-yellow-400 text-black shadow-lg scale-110 ring-4 ring-yellow-400/10 animate-[bolt_0.4s_ease-in-out]"
                      : "bg-transparent text-slate-600 border border-slate-100 hover:border-yellow-400"
                  }
                  ${hasData && !isActive ? "border-green-500 border-2" : ""}
                `}
              >
                {day.dayNum}
                {hasData && (
                  <span
                    className={`absolute -bottom-1.5 w-1.5 h-1.5 rounded-full ${
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
