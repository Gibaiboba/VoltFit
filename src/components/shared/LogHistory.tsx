"use client";

import { formatNumber, formatWater } from "@/lib/utils/format-number";
import { formatToShortDate } from "@/lib/utils/date-utils";
import { ACTIVITIES_MAP } from "@/constants/activities";

interface Log {
  log_date: string;
  steps: number;
  weight: number;
  calories: number;
  sleep_hours: number;
  water: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
  selected_activity_id?: string | null;
  activity_duration?: number;
}

interface LogHistoryProps {
  logs: Log[];
  loading?: boolean;
  title?: string;
  onLogClick?: (date: string) => void;
}

const STATUS_BADGE_STYLE = "border-slate-300 text-slate-600 bg-slate-100";

export default function LogHistory({
  logs,
  loading,
  title,
  onLogClick,
}: LogHistoryProps) {
  if (loading)
    return (
      <p className="text-slate-500 animate-pulse font-black p-4 text-center uppercase tracking-widest italic">
        Загрузка истории...
      </p>
    );

  if (logs.length === 0)
    return (
      <p className="text-slate-400 italic text-center py-8 text-sm font-bold uppercase tracking-tighter">
        Записей пока нет
      </p>
    );

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2 mb-6 px-1">
          {/* Жесткий прямоугольный маркер */}
          <div className="w-2 h-4 bg-slate-900 border border-black/10" />
          <h2 className="text-xs font-black text-slate-900 uppercase italic tracking-tight">
            {title}
          </h2>
        </div>
      )}

      {logs.map((log) => {
        // 🔥 ДИНАМИЧЕСКИ ОПРЕДЕЛЯЕМ НАЗВАНИЕ АКТИВНОСТИ ДЛЯ ВЕРСТКИ КАРТОЧКИ
        const activityId = log.selected_activity_id || "";
        const duration = log.activity_duration || 0;

        const activityText =
          activityId && ACTIVITIES_MAP[activityId]
            ? `${ACTIVITIES_MAP[activityId].name} (${duration} мин)`
            : "День без тренировок";

        return (
          <div
            key={log.log_date}
            onClick={() => onLogClick?.(log.log_date)}
            className={`
              group p-5 rounded-2xl bg-white border-2 border-slate-200 
              hover:border-slate-400 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,0.05)]
              transition-all duration-200 relative overflow-hidden
              ${onLogClick ? "cursor-pointer active:scale-[0.99] active:translate-y-0.5" : ""}
            `}
          >
            {/* Жесткая декоративная полоска вместо размытой */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* Блок даты в светлой палитре */}
                <div className="bg-slate-50 text-slate-900 w-14 h-14 rounded-xl flex flex-col items-center justify-center border-2 border-slate-200 group-hover:border-slate-900 transition-colors">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
                    Дата
                  </span>
                  <span className="font-black italic text-sm text-slate-900">
                    {formatToShortDate(log.log_date)}
                  </span>
                </div>

                <div>
                  {/* 🔥 ВЫВОДИМ ОБНОВЛЕННЫЙ ТЕКСТ ТРЕНИРОВКИ С МИНУТАМИ */}
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider group-hover:text-slate-900 transition-colors italic">
                    {activityText}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 mt-1.5 text-[8px] uppercase font-black rounded-md border-2 italic tracking-wider ${STATUS_BADGE_STYLE}`}
                  >
                    Status: Logged
                  </span>
                </div>
              </div>

              {/* Метрики */}
              <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-4 md:gap-8 flex-1 justify-between md:justify-end">
                <Metric label="Weight" value={log.weight || "--"} unit="kg" />
                <Metric label="Steps" value={formatNumber(log.steps)} />
                <Metric label="Water" value={formatWater(log.water)} unit="L" />
                <Metric label="Sleep" value={log.sleep_hours} unit="h" />
                <Metric
                  label="Energy"
                  value={formatNumber(log.calories)}
                  unit="kcal"
                  color="yellow"
                />

                {/* Макросы (Desktop only) */}
                <div className="hidden lg:flex gap-6 pl-6 border-l-2 border-slate-200">
                  <Metric
                    label="P"
                    value={Math.round(log.proteins || 0)}
                    color="cyan"
                  />
                  <Metric
                    label="F"
                    value={Math.round(log.fats || 0)}
                    color="cyan"
                  />
                  <Metric
                    label="C"
                    value={Math.round(log.carbs || 0)}
                    color="cyan"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
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
    default: "text-slate-900",
    yellow: "text-[#facc15]",
    cyan: "text-[#22d3ee]",
  };

  return (
    <div className="flex flex-col">
      <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-0.5">
        <span
          className={`text-sm font-black italic tracking-tight ${valueColors[color]}`}
        >
          {value}
        </span>
        {unit && (
          <span className="text-[8px] font-black text-slate-400 uppercase italic">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
