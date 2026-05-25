import { LucideIcon, XCircle } from "lucide-react";
import { useState } from "react";

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
}

interface ColorConfig {
  text: string;
  bg: string;
  glow: string;
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
}: MetricInputProps) {
  // Локальное состояние для отслеживания фокуса (чтобы показывать кнопку «X» только при вводе)
  const [isFocused, setIsFocused] = useState(false);

  const themes: Record<MetricColorKey, ColorConfig> = {
    orange: {
      text: "#f97316",
      bg: "bg-orange-500/5",
      glow: "0 2px 8px rgba(249, 115, 22, 0.08)",
    },
    green: {
      text: "#10b981",
      bg: "bg-emerald-500/5",
      glow: "0 2px 8px rgba(16, 185, 129, 0.08)",
    },
    blue: {
      text: "#6366f1",
      bg: "bg-indigo-500/5",
      glow: "0 2px 8px rgba(99, 102, 241, 0.08)",
    },
  };

  const theme = themes[color];
  const inputMode = type === "integer" ? "numeric" : "decimal";
  const pattern = type === "integer" ? "[0-9]*" : "[0-9]*[.,]?[0-9]*";

  // Условие отображения кнопки очистки (есть текст + инпут активен)
  const showClearButton = isFocused && String(value).length > 0;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center w-full transition-all">
      {/* Секция иконки */}
      <div className="flex flex-col items-center gap-1.5 mb-3 select-none">
        <div
          className={`w-11 h-11 rounded-xl ${theme.bg} flex items-center justify-center border border-slate-50`}
          style={{ boxShadow: theme.glow }}
        >
          <Icon className="w-5 h-5" style={{ color: theme.text }} />
        </div>
        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wide">
          {title}
        </span>
      </div>

      {/* Поле ввода */}
      <div className="w-full relative mb-1">
        <div className="flex items-center justify-between gap-1 bg-slate-50 hover:bg-slate-100/70 focus-within:bg-slate-50 focus-within:ring-2 focus-within:ring-slate-200/60 rounded-xl px-3 py-2 transition-all min-h-[44px]">
          {/* Контейнер для инпута и суффикса */}
          <div className="flex items-center justify-center gap-1 flex-1 min-w-0">
            <input
              type="text"
              inputMode={inputMode}
              pattern={pattern}
              value={value}
              onFocus={() => setIsFocused(true)}
              // Используем setTimeout, чтобы клик по кнопке успел отработать до того, как инпут потеряет фокус
              onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              onChange={(e) => {
                const val = e.target.value.replace(
                  type === "integer" ? /[^\d]/g : /[^\d.,]/g,
                  "",
                );
                onChange(val);
              }}
              className="w-full text-2xl font-bold bg-transparent text-center outline-none tracking-tight text-slate-800 placeholder:text-slate-300 min-w-0"
              style={{ color: theme.text }}
            />
            {suffix && (
              <span className="text-sm font-semibold text-slate-400 select-none shrink-0 pr-1">
                {suffix}
              </span>
            )}
          </div>

          {/* Нативная iOS кнопка очистки */}
          {showClearButton && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-slate-300 hover:text-slate-400 transition-colors shrink-0 outline-none focus:text-slate-400"
            >
              <XCircle
                size={16}
                className="fill-current text-white bg-slate-300 rounded-full"
              />
            </button>
          )}
        </div>
      </div>

      {/* Футер */}
      {footer && (
        <div className="mt-2.5 pt-2 border-t border-slate-100/60 w-full text-center select-none">
          <span className="text-[11px] font-medium text-slate-400">
            {footer}
          </span>
        </div>
      )}
    </div>
  );
}
