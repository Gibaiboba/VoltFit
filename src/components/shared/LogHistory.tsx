"use client";
import { formatNumber } from "@/lib/utils/format-number";

interface Log {
  log_date: string;
  steps: number;
  weight: number;
  calories: number;
  sleep_hours: number;
  activity_level: string;
  water: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
}

interface LogHistoryProps {
  logs: Log[];
  loading?: boolean;
  title?: string;
  onLogClick?: (date: string) => void;
}

export default function LogHistory({
  logs,
  loading,
  title,
  onLogClick,
}: LogHistoryProps) {
  // Обновленные стили под VoltFit (темная тема + акценты)
  const getActivityStyle = (activity?: string) => {
    const styles: Record<string, string> = {
      "Силовая тренировка":
        "border-yellow-400/30 text-yellow-400 bg-yellow-400/5",
      "Кардио тренировка": "border-cyan-400/30 text-cyan-400 bg-cyan-400/5",
      "Групповая тренировка":
        "border-purple-400/30 text-purple-400 bg-purple-400/5",
    };
    return (
      styles[activity || ""] || "border-white/10 text-slate-400 bg-white/5"
    );
  };

  if (loading)
    return (
      <p className="text-slate-500 animate-pulse font-black p-4 text-center uppercase tracking-widest italic">
        Загрузка истории...
      </p>
    );

  if (logs.length === 0)
    return (
      <p className="text-slate-600 italic text-center py-8 text-sm font-bold uppercase tracking-tighter">
        Записей пока нет
      </p>
    );

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-5 bg-yellow-400 rounded-full" />
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] italic">
            {title}
          </h2>
        </div>
      )}

      {logs.map((log, idx) => (
        <div
          key={idx}
          onClick={() => onLogClick?.(log.log_date)}
          className={`
            group p-5 rounded-[2rem] bg-[#080808] border border-white/5 
            hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
            transition-all duration-300 relative overflow-hidden
            ${onLogClick ? "cursor-pointer active:scale-[0.98]" : ""}
          `}
        >
          {/* Акцентная полоска при наведении */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Дата в стиле вольтфит */}
              <div className="bg-white/5 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:border-yellow-400/50 transition-colors">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter leading-none mb-1">
                  Дата
                </span>
                <span className="font-black italic text-sm">
                  {log.log_date.split("-")[2]}.{log.log_date.split("-")[1]}
                </span>
              </div>

              <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-wider group-hover:text-yellow-400 transition-colors italic">
                  {log.activity_level || "Без активности"}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 mt-1.5 text-[8px] uppercase font-black rounded border italic tracking-widest ${getActivityStyle(log.activity_level)}`}
                >
                  Status: Logged
                </span>
              </div>
            </div>

            {/* Метрики */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-4 md:gap-8 flex-1 justify-between md:justify-end">
              <Metric label="Weight" value={`${log.weight}`} unit="kg" />
              <Metric label="Steps" value={formatNumber(log.steps)} />
              <Metric
                label="Water"
                value={(log.water / 1000).toFixed(1)}
                unit="L"
              />
              <Metric label="Sleep" value={log.sleep_hours} unit="h" />
              <Metric
                label="Energy"
                value={formatNumber(log.calories)}
                unit="kcal"
                color="yellow"
              />

              {/* Макросы (скрыты на мобилках для чистоты) */}
              <div className="hidden lg:flex gap-6 pl-6 border-l border-white/5">
                <Metric label="P" value={log.proteins || 0} color="cyan" />
                <Metric label="F" value={log.fats || 0} color="cyan" />
                <Metric label="C" value={log.carbs || 0} color="cyan" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  color = "default",
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: "default" | "yellow" | "cyan";
}) {
  const valueColors = {
    default: "text-slate-100",
    yellow: "text-yellow-400",
    cyan: "text-cyan-400",
  };

  return (
    <div className="flex flex-col">
      <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.15em] mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span
          className={`text-sm font-black italic tracking-tight ${valueColors[color]}`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[8px] font-black text-slate-600 uppercase italic">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
