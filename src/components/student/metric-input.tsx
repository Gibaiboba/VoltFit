import { LucideIcon } from "lucide-react";
import { MetricCard } from "./metric-card";

// 1. Определяем допустимые ключи цветов (чтобы нельзя было передать "red")
type MetricColorKey = "orange" | "emerald" | "indigo";

// 2. Интерфейс для самого компонента
interface MetricInputProps {
  title: string;
  icon: LucideIcon;
  value: string | number;
  onChange: (val: string) => void; // Функция обновления
  color: MetricColorKey;
  footer?: string; // Опционально
  suffix?: string; // Опционально (например, "кг" или "ч")
}

// 3. Типизируем объект цветов (Record сопоставляет ключи с объектами стилей)
interface ColorConfig {
  bg: string;
  border: string;
  iconBg: string;
  text: string;
  footerText: string;
  main: string;
}

export default function MetricInput({
  title,
  icon,
  value,
  onChange,
  footer,
  color,
  suffix,
}: MetricInputProps) {
  const colors: Record<MetricColorKey, ColorConfig> = {
    orange: {
      bg: "bg-orange-50/50",
      border: "border-orange-100",
      iconBg: "bg-orange-500",
      text: "text-orange-400",
      footerText: "text-orange-300",
      main: "text-orange-600",
    },
    emerald: {
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-500",
      text: "text-emerald-400",
      footerText: "text-emerald-300",
      main: "text-emerald-600",
    },
    indigo: {
      bg: "bg-indigo-50/50",
      border: "border-indigo-100",
      iconBg: "bg-indigo-500",
      text: "text-indigo-400",
      footerText: "text-indigo-300",
      main: "text-indigo-600",
    },
  };

  // Выбираем текущую тему по ключу
  const currentTheme = colors[color];

  return (
    <MetricCard
      title={title}
      icon={icon}
      footer={footer}
      colorClass={currentTheme}
    >
      <div className="flex items-baseline justify-center">
        <input
          type="number"
          step="0.1" // Позволяет вводить дробные (например, вес 70.5)
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full text-2xl font-black italic bg-transparent text-center outline-none ${currentTheme.main}`}
        />
        {suffix && (
          <span
            className={`text-[10px] font-black ml-0.5 uppercase ${currentTheme.main}`}
          >
            {suffix}
          </span>
        )}
      </div>
    </MetricCard>
  );
}
