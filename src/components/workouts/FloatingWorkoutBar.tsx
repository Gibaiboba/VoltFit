"use client";

import { useState, useEffect, useMemo } from "react";
import { Maximize2, Timer, Dumbbell, X } from "lucide-react";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";
import { formatTime } from "@/lib/utils/format-number";

export function FloatingWorkoutBar() {
  const {
    isWorkoutActive,
    isMinimized,
    customWorkoutName,
    isTimerStarted,
    startedAt,
    restEndTime,
    maximizeWorkout,
    resetWorkoutSession,
  } = useActiveWorkoutStore();

  const [now, setNow] = useState<number>(() => Date.now());

  // Тикер для обновления времени на плашке раз в секунду
  useEffect(() => {
    if (!isWorkoutActive || !isMinimized) return;
    if (!isTimerStarted && !restEndTime) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorkoutActive, isMinimized, isTimerStarted, restEndTime]);

  const secondsElapsed = useMemo(() => {
    if (!isTimerStarted || !startedAt) return 0;
    return Math.max(0, Math.floor((now - startedAt) / 1000));
  }, [isTimerStarted, startedAt, now]);

  const restTimeLeft = useMemo(() => {
    if (!restEndTime) return null;
    const diff = Math.ceil((restEndTime - now) / 1000);
    return diff > 0 ? diff : null;
  }, [restEndTime, now]);

  // Обработчик полного закрытия тренировки прямо с плашки
  const handleCloseBar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал maximizeWorkout
    if (
      window.confirm(
        "Закрыть и прервать тренировку? Текущий прогресс не будет сохранен.",
      )
    ) {
      resetWorkoutSession();
    }
  };

  if (!isWorkoutActive || !isMinimized) return null;

  return (
    <div className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom))] md:bottom-24 left-0 right-0 z-40 px-4 pointer-events-none animate-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div
          role="button"
          tabIndex={0}
          onClick={maximizeWorkout}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") maximizeWorkout();
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 transition-all active:scale-[0.99] cursor-pointer"
        >
          {/* Левая часть: Иконка, статус и название */}
          <div className="flex items-center gap-3 min-w-0 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 relative">
              <Dumbbell size={18} />
              {isTimerStarted && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  {isTimerStarted ? "Тренировка идёт" : "Подготовка"}
                </span>
                {restTimeLeft !== null && (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-black inline-flex items-center gap-1">
                    <Timer size={10} /> Отдых: {restTimeLeft}с
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-white truncate">
                {customWorkoutName || "Активная тренировка"}
              </p>
            </div>
          </div>

          {/* Правая часть: Живой таймер, кнопка разворачивания и крестик закрытия */}
          <div className="flex items-center gap-2 shrink-0">
            {isTimerStarted && (
              <span className="text-base font-black italic text-blue-400 tracking-wider mr-1">
                {formatTime(secondsElapsed)}
              </span>
            )}

            <div
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title="Развернуть тренировку"
            >
              <Maximize2 size={16} />
            </div>

            <button
              type="button"
              onClick={handleCloseBar}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Прервать и закрыть тренировку"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
