"use client";

import { LucideIcon } from "lucide-react";

type MetricType = "decimal" | "integer";
type MetricColorKey = "orange" | "green" | "blue";

interface MetricInputProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  onChange: (val: string) => void;
  color: MetricColorKey;
  type?: MetricType;
  footer?: string;
  suffix?: string;
  // ДОБАВЛЕНО: Свойство для получения ошибки из родителя
  error?: string;
}

interface ColorConfig {
  iconColor: string;
  textColor: string;
}

export default function MetricInput({
  title,
  icon: Icon,
  value,
  onChange,
  footer,
  color,
  type = "decimal",
  suffix,
  error, // ДОБАВЛЕНО: Деструктурируем ошибку
}: MetricInputProps) {
  const themes: Record<MetricColorKey, ColorConfig> = {
    orange: {
      iconColor: "#f97316",
      textColor: "text-blue-900",
    },
    green: {
      iconColor: "#10b981",
      textColor: "text-emerald-950",
    },
    blue: {
      iconColor: "#6366f1",
      textColor: "text-indigo-950",
    },
  };

  const theme = themes[color];
  const inputMode = type === "integer" ? "numeric" : "decimal";
  const pattern = type === "integer" ? "[0-9]*" : "[0-9]*[.,]?[0-9]*";

  return (
    <div className="bg-white px-6 py-2 sm:py-10 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-6 w-full transition-all hover:shadow-md hover:border-slate-200/60">
      {/* Левая сторона: Иконка + Заголовок */}
      <div className="flex items-center gap-3 select-none shrink-0">
        <div className="w-10 h-14 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6" style={{ color: theme.iconColor }} />
        </div>
        <span
          className={`text-base font-extrabold uppercase tracking-wider ${theme.textColor}`}
        >
          {title}
        </span>
      </div>

      {/* Правая сторона: Поле ввода */}
      <div className="flex flex-col items-end gap-2 flex-1 max-w-[200px] sm:max-w-[240px]">
        <div className="w-full relative">
          {/* 
            ИЗМЕНЕНО: 
            Если есть ошибка, меняем фон на нежно-красный (bg-red-50/40) 
            и добавляем красную рамку (border-red-400 focus-within:ring-red-200)
          */}
          <div
            className={`flex items-center justify-between gap-2 focus-within:ring-2 rounded-2xl px-4 py-3.5 transition-all min-h-[56px] border ${
              error
                ? "bg-red-50/40 border-red-300 focus-within:ring-red-100"
                : "bg-slate-50 hover:bg-slate-100/70 focus-within:bg-slate-50 border-transparent focus-within:ring-slate-200/60"
            }`}
          >
            <div className="flex items-baseline justify-end gap-1 flex-1 min-w-0">
              <input
                type="text"
                inputMode={inputMode}
                pattern={pattern}
                value={value}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value.replace(
                    type === "integer" ? /[^\d]/g : /[^\d.,]/g,
                    "",
                  );
                  onChange(val);
                }}
                className={`w-full text-3xl font-black bg-transparent text-right outline-none tracking-tight placeholder:text-slate-300 min-w-0 ${theme.textColor}`}
              />
              {suffix && (
                <span className="text-sm font-bold text-slate-400 select-none shrink-0 pl-0.5">
                  {suffix}
                </span>
              )}
            </div>
          </div>
        </div>

        {error ? (
          <span className="text-xs font-bold text-red-500 select-none tracking-wide text-right pr-2 animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </span>
        ) : (
          footer && (
            <span className="text-xs font-semibold text-slate-400 select-none tracking-wide text-right pr-2">
              {footer}
            </span>
          )
        )}
      </div>
    </div>
  );
}
