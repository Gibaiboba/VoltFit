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
  const getActivityStyle = (activity?: string) => {
    const styles: Record<string, string> = {
      "Силовая тренировка": "bg-red-100 text-red-600 border-red-200",
      "Кардио тренировка": "bg-orange-100 text-orange-600 border-orange-200",
      "Групповая тренировка": "bg-purple-100 text-purple-600 border-purple-200",
    };
    return (
      styles[activity || ""] || "bg-slate-100 text-slate-500 border-slate-200"
    );
  };

  if (loading)
    return (
      <p className="text-slate-400 animate-pulse font-bold p-4 text-center">
        Загрузка истории...
      </p>
    );

  if (logs.length === 0)
    return (
      <p className="text-slate-400 italic text-center py-8 text-sm">
        Записей пока нет
      </p>
    );

  return (
    <div className="space-y-4">
      {title && (
        <h2 className="text-xl font-black text-slate-800 mb-6">{title}</h2>
      )}
      {logs.map((log, idx) => (
        <div
          key={idx}
          // Добавляем обработчик клика и курсор
          onClick={() => onLogClick?.(log.log_date)}
          className={`
            group p-5 rounded-3xl bg-slate-50 border border-slate-100 
            hover:bg-white hover:shadow-md hover:border-blue-200 
            transition-all duration-200 relative overflow-hidden
            ${onLogClick ? "cursor-pointer active:scale-[0.98]" : ""}
          `}
        >
          {/* Маленький индикатор кликабельности (синяя полоска сбоку при наведении) */}
          {onLogClick && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border border-slate-100 shadow-sm group-hover:border-blue-100">
                {log.log_date.split("-")[2]}.{log.log_date.split("-")[1]}
              </div>
              <div>
                <p className="text-sm font-black text-slate-700 leading-tight group-hover:text-blue-600 transition-colors">
                  {log.activity_level}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 mt-1 text-[9px] uppercase font-bold rounded-md border ${getActivityStyle(log.activity_level)}`}
                >
                  {log.activity_level}
                </span>
              </div>
            </div>
            <div className="flex gap-6 justify-between sm:justify-end">
              <Metric label="Вес" value={`${log.weight}кг`} />
              <Metric label="Шаги" value={formatNumber(log.steps)} />
              <Metric label="Ккал" value={formatNumber(log.calories)} />
              <Metric
                label="Вода"
                value={`${(log.water / 1000).toFixed(1)}л`} // Переводим мл в литры (например, 2.5л)
              />
              <Metric label="Сон" value={`${log.sleep_hours}ч`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center min-w-[50px]">
      <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 tracking-tighter">
        {label}
      </p>
      <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
  );
}
