"use client";

import { Moon, Minus, Plus } from "lucide-react";

interface SleepStepInputProps {
  value: string | number;
  onChange: (val: string) => void;
  error?: string;
}

export default function SleepStepInput({
  value,
  onChange,
  error,
}: SleepStepInputProps) {
  const DEFAULT_SUGGESTION = 8;

  const parsedValue = parseFloat(String(value).replace(",", ".")) || 0;
  const isActive = parsedValue > 0;
  const displayValue = isActive ? parsedValue : DEFAULT_SUGGESTION;

  const formatHoursAndMinutes = (val: number) => {
    const hours = Math.floor(val);
    const minutes = Math.round((val - hours) * 60);
    if (minutes === 0) return `${hours} ч`;
    return `${hours} ч ${minutes} м`;
  };

  const getSleepFeedback = () => {
    if (!isActive) {
      return {
        text: `Рекомендуется ~${DEFAULT_SUGGESTION} часов сна (нажмите)`,
        textColor: "text-slate-400 italic",
        iconColor: "#94a3b8",
      };
    }
    if (displayValue < 5) {
      return {
        text: "Критически мало сна. Нужно отдохнуть!",
        textColor: "text-red-500 font-bold",
        iconColor: "#ef4444",
      };
    }
    if (displayValue < 7) {
      return {
        text: "Недосып. Постарайтесь поспать подольше",
        textColor: "text-amber-500 font-medium",
        iconColor: "#f59e0b",
      };
    }
    if (displayValue <= 9) {
      return {
        text: "Отличная продолжительность сна!",
        textColor: "text-emerald-500 font-bold",
        iconColor: "#10b981",
      };
    }
    return {
      text: "Многовато сна (пересып утомляет)",
      textColor: "text-indigo-600 font-medium",
      iconColor: "#4f46e5",
    };
  };

  const feedback = getSleepFeedback();

  const handleStep = (direction: "increment" | "decrement") => {
    let newValue = displayValue;

    if (!isActive) {
      newValue = DEFAULT_SUGGESTION;
    } else {
      newValue =
        direction === "increment" ? parsedValue + 0.25 : parsedValue - 0.25;
    }

    if (newValue < 0) newValue = 0;
    if (newValue > 24) newValue = 24;

    onChange(String(newValue));
  };

  return (
    <div className="bg-white px-6 pt-4 sm:pt-10 pb-9 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-6 w-full transition-all hover:shadow-md hover:border-slate-200/60">
      {/* Левая сторона: Иконка + Заголовок */}
      <div className="flex items-center gap-3 select-none shrink-0">
        <div className="w-10 h-14 flex items-center justify-center shrink-0">
          <Moon
            className="w-6 h-6 transition-colors duration-300"
            style={{ color: feedback.iconColor }}
          />
        </div>
        <span
          className={`text-base font-extrabold uppercase tracking-wider transition-colors duration-300 ${isActive ? "text-indigo-950" : "text-slate-400"}`}
        >
          Сон
        </span>
      </div>

      {/* Правая сторона: Контейнер степпера */}
      <div className="flex flex-col items-end gap-2 flex-1 max-w-[200px] sm:max-w-[240px] relative">
        <div className="w-full">
          <div
            className={`flex items-center justify-between gap-1 rounded-2xl px-2 transition-all min-h-[56px] border ${
              error
                ? "bg-red-50/40 border-red-300"
                : "bg-slate-50 hover:bg-slate-100/70 border-transparent"
            }`}
          >
            <button
              type="button"
              onClick={() => handleStep("decrement")}
              disabled={isActive && parsedValue <= 0}
              className="w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0"
            >
              <Minus className="w-3.5 h-3.5 text-slate-700" />
            </button>

            <div className="flex items-baseline justify-center flex-1 min-w-0 select-none px-1">
              <span
                className={`text-base sm:text-lg font-black tracking-tight text-center transition-colors break-keep ${isActive ? "text-indigo-950" : "text-slate-400"}`}
              >
                {formatHoursAndMinutes(displayValue)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStep("increment")}
              disabled={displayValue >= 24}
              className="w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-[60px] w-[280px] sm:w-[340px] text-right pr-2 select-none z-10">
          {error ? (
            <span className="text-xs font-bold text-red-500 tracking-wide animate-in fade-in slide-in-from-top-1 duration-150 block">
              {error}
            </span>
          ) : (
            <div className="text-xs font-semibold tracking-wide animate-in fade-in duration-200 block whitespace-normal">
              <span className={feedback.textColor}>{feedback.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
