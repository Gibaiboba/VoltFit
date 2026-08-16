"use client";

import { useMemo } from "react";

interface CaloriesBannerProps {
  current: number;
  burned?: number;
  target: number;
  progress: number;
}

export default function CaloriesBanner({
  current = 0,
  burned = 0,
  target = 0,
  progress = 0,
}: CaloriesBannerProps) {
  const roundedCurrent = Math.round(current) || 0;
  const roundedBurned = Math.round(burned) || 0;
  const validTarget = target > 0 ? target : 0;
  // Динамический расчёт: к базовой цели прибавляем активность и вычитаем съеденное
  const caloriesLeft = Math.max(
    0,
    validTarget + roundedBurned - roundedCurrent,
  );
  const validatedProgress = Math.max(0, Math.min(progress, 100));

  const radius = 50;
  const strokeWidth = 8;
  const center = 60;

  const totalCircumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const arcLength = useMemo(
    () => (220 / 360) * totalCircumference,
    [totalCircumference],
  );

  const strokeDashoffset = useMemo(() => {
    return arcLength - (validatedProgress / 100) * arcLength;
  }, [validatedProgress, arcLength]);

  const rotationAngle = 160;

  return (
    <div className="bg-white rounded-xl p-2.5 sm:p-5 text-slate-900 shadow-xl shadow-slate-100/50 relative overflow-hidden border border-slate-100 w-full">
      <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full max-w-2xl gap-0 sm:gap-4">
          <div className="flex flex-col items-center text-center flex-1 mt-2 sm:mt-0">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.11em] text-slate-400 mb-0.5">
              Употреблено
            </span>
            <div className="text-sm sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
              {roundedCurrent}
              <span className="text-[8px] sm:text-xs font-bold text-slate-400 ml-0.5">
                ккал
              </span>
            </div>
          </div>

          {/* ЦЕНТР: Компактный контейнер арки */}
          {/* ИЗМЕНЕНО: Ограничили ширину на мобилках до 115px, чтобы боковые блоки влезли без огромных полей */}
          <div className="relative w-full max-w-[115px] sm:max-w-[180px] flex flex-col items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 120 90" className="w-full h-auto block">
              {/* Серая подложка */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                className="text-slate-100"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={`${arcLength} ${totalCircumference}`}
                transform={`rotate(${rotationAngle} ${center} ${center})`}
              />

              {/* Прогресс */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                className={`ease-out transition-all duration-1000 ${
                  validTarget > 0 && roundedCurrent > validTarget
                    ? "text-red-500"
                    : "text-emerald-500"
                }`}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={`${arcLength} ${totalCircumference}`}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotationAngle} ${center} ${center})`}
              />
            </svg>

            {/* Контент внутри арки */}

            <div className="absolute inset-x-0 bottom-0.5 sm:bottom-1 flex flex-col items-center justify-center text-center select-none">
              <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                Осталось
              </span>
              <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                {caloriesLeft}
              </span>

              {/* ИЗМЕНЕНО: Чуть уплотнены паддинги для мобилок */}
              <div className="text-[7px] sm:text-[9px] font-bold text-slate-500 bg-slate-50 px-1 sm:px-1.5 py-0.5 rounded-full border border-slate-100 whitespace-nowrap">
                Цель:{" "}
                <span className="font-extrabold text-slate-700">
                  {validTarget + roundedBurned} ккал
                </span>
              </div>
            </div>
          </div>

          {/* СПРАВА: Активных */}

          <div className="flex flex-col items-center text-center flex-1 mt-2 sm:mt-0">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.11em] text-slate-400 mb-0.5">
              Активных
            </span>
            <div className="text-sm sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
              {roundedBurned}
              <span className="text-[8px] sm:text-xs font-bold text-slate-400 ml-0.5">
                ккал
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />
    </div>
  );
}
