import { LucideIcon } from "lucide-react";

type MetricColorKey = "orange" | "green" | "blue";

interface MetricInputProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  onChange: (val: string) => void;
  color: MetricColorKey;
  footer?: string;
  suffix?: string;
}

interface ColorConfig {
  iconText: string;
  iconBg: string;
  glow: string;
}

export default function MetricInput({
  title,
  icon: Icon,
  value,
  onChange,
  footer,
  color,
  suffix,
}: MetricInputProps) {
  // Цветовые схемы для иконок (Вес, Шаги, Сон)
  const themes: Record<MetricColorKey, ColorConfig> = {
    orange: {
      iconText: "text-orange-400", // Цвет для Веса
      iconBg: "bg-orange-500/10",
      glow: "shadow-[0_0_15px_rgba(251,146,60,0.2)]",
    },
    green: {
      iconText: "text-emerald-400", // Цвет для Шагов
      iconBg: "bg-emerald-500/10",
      glow: "shadow-[0_0_15px_rgba(52,211,153,0.2)]",
    },
    blue: {
      iconText: "text-indigo-400", // Цвет для Сна
      iconBg: "bg-indigo-500/10",
      glow: "shadow-[0_0_15px_rgba(129,140,248,0.2)]",
    },
  };

  const theme = themes[color];

  return (
    <div className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center group transition-all hover:border-yellow-400/20">
      {/* Секция иконки */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-2xl ${theme.iconBg} ${theme.glow} flex items-center justify-center border border-white/5`}
        >
          <Icon
            className={`w-6 h-6 ${theme.iconText} transition-transform group-hover:scale-110`}
          />
        </div>
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
          {title}
        </span>
      </div>

      {/* Поле ввода (Volt Value) */}
      <div className="flex items-baseline justify-center w-full relative mb-3">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-4xl font-black italic bg-transparent text-center outline-none text-yellow-400 placeholder:text-yellow-400/20"
        />
        {suffix && (
          <span className="absolute right-0 bottom-1 text-[10px] font-black uppercase text-yellow-400/30">
            {suffix}
          </span>
        )}
      </div>

      {/* Футер */}
      {footer && (
        <div className="mt-2 pt-3 border-t border-white/5 w-full text-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">
            {footer}
          </span>
        </div>
      )}
    </div>
  );
}
