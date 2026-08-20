"use client";

import { Droplets, Plus, Minus } from "lucide-react";

interface MetricWaterProps {
  value: number;
  onAdd: () => void;
  onRemove: () => void;
  error?: string;
}

export default function MetricWater({
  value,
  onAdd,
  onRemove,
  error,
}: MetricWaterProps) {
  const waterColor = "#0ea5e9";
  const isActive = value > 0;

  return (
    <div
      className={`bg-white px-4 py-5 sm:px-6 sm:pt-10 sm:pb-11 rounded-xl border border-slate-100 shadow-sm flex flex-row items-center justify-between gap-3 w-full transition-all hover:shadow-md hover:border-slate-200/60 ${error ? "border-red-100" : ""}`}
    >
      {/* Левая сторона: Иконка + Текст */}
      <div className="flex items-center gap-2 sm:gap-3 select-none min-w-0">
        <div className="w-8 h-10 sm:w-10 sm:h-14 flex items-center justify-center shrink-0">
          <Droplets
            className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300"
            style={{ color: isActive ? waterColor : "#94a3b8" }}
          />
        </div>

        {/* БЛОК ЦИФР И ФУТЕРА */}
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={`text-xs sm:text-sm font-bold uppercase tracking-wider visual-anchor transition-colors duration-300 ${
              isActive ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Вода
          </span>
          <div className="flex items-baseline gap-1">
            <span
              className="text-xl sm:text-2xl font-black italic tracking-tighter tabular-nums transition-all duration-300"
              style={{
                color: isActive ? waterColor : "#94a3b8",
                textShadow: isActive ? `0 2px 8px ${waterColor}20` : "none",
              }}
            >
              {value}
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase text-slate-400 shrink-0">
              мл
            </span>
          </div>
        </div>
      </div>

      {/* Правая сторона: Кнопки управления */}
      <div
        className={`relative flex gap-3 sm:gap-4 shrink-0 p-1.5 sm:p-2.5 rounded-2xl transition-all border ${
          error ? "bg-red-50/20 border-red-200" : "border-transparent"
        }`}
      >
        {/* Минус */}
        <button
          onClick={onRemove}
          disabled={value <= 0}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:bg-slate-100 hover:text-slate-600 active:scale-95 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 disabled:active:scale-100 transition-all flex items-center justify-center cursor-pointer shrink-0"
        >
          <Minus size={16} className="sm:scale-110" strokeWidth={2.5} />
        </button>

        {/* Плюс 250мл */}
        <button
          onClick={onAdd}
          className="h-12 sm:h-14 px-5 sm:px-7 rounded-xl font-extrabold text-[11px] sm:text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
          style={{
            color: isActive ? waterColor : "#64748b",
            backgroundColor: isActive ? `${waterColor}12` : "#f1f5f9",
          }}
          onMouseEnter={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = `${waterColor}18`;
            } else {
              e.currentTarget.style.backgroundColor = "#e2e8f0";
            }
          }}
          onMouseLeave={(e) => {
            if (isActive) {
              e.currentTarget.style.backgroundColor = `${waterColor}12`;
            } else {
              e.currentTarget.style.backgroundColor = "#f1f5f9";
            }
          }}
        >
          <Plus size={14} className="sm:scale-110" strokeWidth={3} />
          <span>
            <span className="hidden xs:inline">+</span>250 мл
          </span>
        </button>

        {error && (
          <span className="absolute top-[105%] right-2 text-[10px] font-bold text-red-500 tracking-wide whitespace-nowrap text-right animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
