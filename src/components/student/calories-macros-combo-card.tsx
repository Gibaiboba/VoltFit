"use client";

import { Flame } from "lucide-react";

interface MacroItem {
  label: string;
  current: number;
  target: number;
  colors: {
    stroke: string;
    bg?: string;
    accent?: string;
  };
}

interface CaloriesMacrosComboCardProps {
  current: number;
  target: number;
  progress: number;
  macros: MacroItem[];
  burnedCalories?: number;
}

export function CaloriesMacrosComboCard({
  current = 0,
  target = 0,
  progress = 0,
  macros,
  burnedCalories = 0,
}: CaloriesMacrosComboCardProps) {
  const roundedCurrent = Math.round(current) || 0;
  const validTarget = target > 0 ? target : 0;

  // Параметры для SVG Кругового Прогресс-бара
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const cappedProgress = Math.min(progress, 100);
  const strokeDashoffset =
    circumference - (cappedProgress / 100) * circumference;

  return (
    <div className="bg-white rounded-xl px-5 py-2.5 sm:p-7 text-slate-900 shadow-xl shadow-slate-100/50 relative overflow-hidden border border-slate-100 space-y-4 sm:space-y-6">
      {/* --- ВЕРХНИЙ БЛОК: КАЛОРИИ И КРУГОВОЙ ПРОГРЕСС --- */}
      <div className="flex items-center justify-between gap-4 relative z-10">
        {/* Левая часть: Текстовые метрики калорий */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Калории
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
              {roundedCurrent}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-400 tracking-normal">
              / {validTarget} ккал
            </span>
          </div>

          {/* Плашка активности в янтарно-оранжевых тонах вместо "Осталось" */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100/50">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Активность:{" "}
              <span className="text-amber-600 font-black">
                +{burnedCalories} ккал
              </span>
            </span>
          </div>
        </div>

        {/* Правая часть: SVG Прогресс-круг (Темно-зеленый) */}
        <div className="relative flex items-center justify-center shrink-0 w-24 h-24 sm:w-28 sm:h-28">
          <svg className="w-full h-full transform -rotate-90">
            {/* Фоновое кольцо */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Активное кольцо прогресса (emerald-800) */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              className="stroke-emerald-800 transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {/* Текст с процентами внутри круга */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base sm:text-lg font-black tracking-tighter text-emerald-900">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* --- НИЖНИЙ БЛОК: МАКРОНУТРИЕНТЫ --- */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 relative z-10 pt-2">
        {macros.map((m) => {
          const macroProgress = m.target > 0 ? (m.current / m.target) * 100 : 0;
          const cappedMacroProgress = Math.min(macroProgress, 100);

          return (
            <div key={m.label} className="flex flex-col gap-2">
              {/* Шапка макроса: Только Название */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider truncate">
                  {m.label}
                </span>
              </div>

              {/* Прогресс-бар макроса (Линия) */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${cappedMacroProgress}%`,
                    backgroundColor: m.colors.stroke,
                    boxShadow: `0 0 8px ${m.colors.stroke}40`,
                  }}
                />
              </div>

              {/* Цифры макроса под баром */}
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span
                  className="text-base sm:text-lg font-black italic tracking-tight"
                  style={{ color: m.colors.stroke }}
                >
                  {Math.round(m.current)}
                </span>
                <span className="text-[9px] sm:text-xs font-medium text-slate-400">
                  / {m.target}г
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Мягкое фоновое свечение (теперь зеленое под цвет кольца) */}
      <div className="absolute right-4 top-4 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
    </div>
  );
}
