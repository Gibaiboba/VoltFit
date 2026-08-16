"use client";

import { useMemo, useState } from "react";
import { useWaterTracker } from "@/hooks/use-water-tracker";

interface WaterTrackerCardProps {
  serverToday: string;
}

export default function WaterTrackerCard({
  serverToday,
}: WaterTrackerCardProps) {
  const { target, current, updateWater, isPending, disabled } =
    useWaterTracker(serverToday);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const percentage = Math.min(100, Math.round((current / target) * 100));
  const WATER_STEP = 250;

  const totalGlasses = useMemo(() => {
    return Math.max(8, Math.ceil(target / WATER_STEP));
  }, [target]);

  const glassGrid = useMemo(() => {
    return Array.from({ length: totalGlasses }).map((_, index) => {
      const glassStartAmount = index * WATER_STEP;
      const glassEndAmount = (index + 1) * WATER_STEP;

      if (current >= glassEndAmount) return 100;
      if (current <= glassStartAmount) return 0;

      const partialAmount = current - glassStartAmount;
      return Math.round((partialAmount / WATER_STEP) * 100);
    });
  }, [current, totalGlasses]);

  const handleGlassClick = (fillPercent: number) => {
    if (disabled || isPending) return;
    if (fillPercent === 100) {
      updateWater(-WATER_STEP);
    } else {
      updateWater(WATER_STEP);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl p-4 sm:p-5 border border-slate-100 shadow-xl shadow-slate-100/50 select-none relative">
      {/* Шапка виджета */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">
            Вода
          </h3>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5">
            Цель: {target} мл <span className="text-slate-300 mx-1">|</span>{" "}
            {percentage}%
          </p>
        </div>

        {/* Правый блок: Цифры + Плюс */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-blue-500">
              {current}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 ml-0.5">
              мл
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center font-black text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:scale-95 transition-all cursor-pointer text-sm shadow-sm"
            title="Расширенное добавление"
          >
            +
          </button>
        </div>
      </div>

      {/* СЕТКА СТАКАНОВ: Подложка полностью убрана */}
      <div className="w-full">
        <div
          /* ИЗМЕНЕНО: Убрали bg-slate-50/50, border, border-slate-100 и drop-shadow. Оставили только сетку и отступы (p-1 добавлен для компенсации scale-эффекта при клике) */
          className="grid grid-cols-4 sm:flex sm:flex-row gap-2.5 sm:gap-3 p-1 items-end justify-between"
        >
          {glassGrid.map((fillPercent, index) => (
            <div
              key={index}
              className="relative w-full flex justify-center sm:flex-1"
            >
              <button
                type="button"
                disabled={disabled || isPending}
                onClick={() => handleGlassClick(fillPercent)}
                className="group relative h-12 sm:h-18 bg-gradient-to-b from-white/40 via-slate-100/60 to-slate-200/40 border-2 border-slate-300 border-t-0 overflow-hidden flex items-end active:scale-95 transition-all duration-150 disabled:opacity-80 cursor-pointer w-full max-w-[45px] sm:max-w-none shadow-[inset_0_0_6px_rgba(255,255,255,0.8),_inset_0_-4px_6px_rgba(148,163,184,0.1)]"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 82% 100%, 18% 100%)",
                }}
              >
                <div
                  className="w-full bg-gradient-to-t from-blue-700 via-blue-500 to-blue-400 transition-all duration-500 ease-out group-hover:brightness-105 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]"
                  style={{ height: `${fillPercent * 0.93}%` }}
                />
                <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-white/50 via-white/20 to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-[8%] bg-gradient-to-l from-white/30 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-300/40 backdrop-blur-[1px] pointer-events-none border-t border-white/20" />

                <div className="absolute inset-x-0 bottom-2 top-[25%] hidden sm:flex flex-col justify-between p-1 opacity-30 pointer-events-none">
                  <div className="w-2/3 h-[1px] bg-slate-400 mx-auto" />
                  <div className="w-1/2 h-[1px] bg-slate-400 mx-auto" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900/5 pointer-events-none">
                  <span className="text-xs font-black text-blue-600 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-blue-100">
                    {fillPercent === 100 ? "–" : "+"}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО / BOTTOM SHEET */}
      {isModalOpen && (
        /* ИЗМЕНЕНО: items-end на мобильных (прижимает к низу), sm:items-center для десктопа */
        <div
          className="fixed inset-0 z-50 flex sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)} // Закрытие по клику на фон
        >
          <div
            /* ИЗМЕНЕНО: Скругление только сверху rounded-t-3xl на мобилках, сдвиг снизу вверх slide-in-from-bottom */
            className="w-full sm:max-w-xs bg-white p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 text-center space-y-5 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Декоративная полоса для закрытия свайпом на мобильных */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto sm:hidden -mt-2 mb-2" />

            <div>
              <h4 className="text-base font-black text-slate-900 uppercase italic tracking-tight">
                Водный баланс
              </h4>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                Текущая цель дня: {target} мл
              </p>
            </div>

            {/* Контроллер Мл */}
            <div className="flex items-center justify-center gap-4 bg-slate-50 py-3 px-4 rounded-2xl border border-slate-100">
              <button
                type="button"
                disabled={current === 0 || isPending}
                onClick={() => updateWater(-WATER_STEP)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-black text-lg text-slate-700 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition active:scale-95 disabled:opacity-40"
              >
                –
              </button>

              <div className="flex flex-col min-w-[80px]">
                <span className="text-xl font-black text-blue-600">
                  {current}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  из {target} мл
                </span>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => updateWater(WATER_STEP)}
                className="w-10 h-10 rounded-xl bg-white border border-slate-200 font-black text-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition active:scale-95"
              >
                +
              </button>
            </div>

            {/* Кнопка закрытия */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition active:scale-[0.98]"
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
