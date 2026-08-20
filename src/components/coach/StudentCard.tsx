"use client";
import { memo, useMemo, useState } from "react";
import { StudentView } from "@/types/coach";
import { ACTIVITIES_MAP } from "@/constants/activities";
import { LoggedActivity } from "@/hooks/use-student-dashboard/types";
import { X } from "lucide-react";
import { toISODate } from "@/lib/utils/date-utils";

interface StudentCardProps {
  item: StudentView;
  weeklySteps: number;
  onClick: (student: StudentView) => void;
  onRemove: (studentId: string) => void;
}

const getActivityStyle = (activityName?: string) => {
  const baseStyle = "text-slate-800 border font-medium";
  if (!activityName || activityName === "День без тренировок") {
    return `${baseStyle} bg-slate-50 border-slate-100 text-slate-400`;
  }
  const lower = activityName.toLowerCase();

  if (
    lower.includes("силов") ||
    lower.includes("тяжел") ||
    lower.includes("кроссфит")
  ) {
    return `${baseStyle} bg-slate-900 border-slate-950 text-white`; // Черный акцент
  }
  if (
    lower.includes("бег") ||
    lower.includes("плаван") ||
    lower.includes("вело") ||
    lower.includes("сайкл")
  ) {
    return `${baseStyle} bg-slate-200 border-slate-300 text-slate-800`; // Плотный серый
  }
  if (
    lower.includes("йога") ||
    lower.includes("растяж") ||
    lower.includes("аэроб") ||
    lower.includes("танц")
  ) {
    return `${baseStyle} bg-slate-100 border-slate-200 text-slate-700`; // Легкий серый
  }
  return `${baseStyle} bg-slate-50 border-slate-200 text-slate-800`;
};

function StudentCard({ item, onClick, onRemove }: StudentCardProps) {
  const lastLog = item.student.daily_logs?.[0];
  const [isConfirming, setIsConfirming] = useState(false);

  // Вычисляем, является ли последний отчет сегодняшним
  const isTodayLog = useMemo(() => {
    if (!lastLog?.log_date) return false;
    const todayStr = toISODate(new Date());
    return lastLog.log_date === todayStr;
  }, [lastLog?.log_date]);

  // Возвращает массив строк вместо одной строки через запятую
  const computedActivities = useMemo<string[]>(() => {
    const logActivities = lastLog?.activities || [];
    if (logActivities.length === 0) return ["День без тренировок"];
    return logActivities.map((a: LoggedActivity) => {
      const config = ACTIVITIES_MAP[a.activity_id];
      return config ? config.name.split(" ").slice(1).join(" ") : "Тренировка";
    });
  }, [lastLog?.activities]);

  const handleCardClick = () => {
    onClick(item);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(true);
  };

  const handleCancelRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirming(false);
  };

  const handleConfirmRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(item.student.id);
    setIsConfirming(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group relative"
    >
      {/* Шапка карточки */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
        <div className="space-y-1.5">
          <p className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
            {item.student.full_name}
          </p>
        </div>

        {/* Индикатор даты отчета */}
        <div className="text-left sm:text-right flex items-center justify-between sm:justify-end gap-4 min-h-[40px] shrink-0">
          {!isConfirming && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <p className="text-[10px] text-slate-400 uppercase font-bold whitespace-nowrap">
                Отчет:
              </p>
              {/* Динамический цвет: зеленый если сегодня, серый если старый */}
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors whitespace-nowrap ${
                  isTodayLog
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-slate-50 text-slate-600"
                }`}
              >
                {isTodayLog ? "Сегодня" : lastLog?.log_date || "—"}
              </span>
            </div>
          )}

          {/* Кнопка удаления */}
          <div
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {!isConfirming ? (
              <button
                onClick={handleRemoveClick}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
                title="Прекратить сотрудничество"
              >
                <X size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-red-50/60 px-3 py-1.5 rounded-xl border border-red-100/60 animate-in fade-in zoom-in-95 duration-150 text-xs font-bold">
                <span className="text-red-700">Точно удалить ученика?</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmRemove}
                    className="text-red-600 hover:text-red-700 underline underline-offset-2 transition-colors"
                  >
                    Да
                  </button>
                  <span className="text-red-200">|</span>
                  <button
                    onClick={handleCancelRemove}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Нет
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Блок активности */}
      <div className="flex flex-col gap-2 mb-5">
        {computedActivities.map((activity, index) => (
          <span
            key={index}
            className={`block w-full text-left px-4 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-xl border ${getActivityStyle(activity)}`}
          >
            {activity}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-6 text-sm font-bold text-slate-700">
        {/* 1. Ккал */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase mb-1">Ккал</p>
          {lastLog?.calories || 0}
        </div>

        {/* 2. Б / Ж / У */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase mb-1">Б / Ж / У</p>
          <div className="flex gap-1 text-[11px]">
            <span className="text-blue-600">{lastLog?.proteins || 0}</span>
            <span className="text-slate-300">/</span>
            <span className="text-orange-500">{lastLog?.fats || 0}</span>
            <span className="text-slate-300">/</span>
            <span className="text-emerald-500">{lastLog?.carbs || 0}</span>
          </div>
        </div>

        {/* 3. Шаги */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase mb-1">Шаги</p>
          {lastLog?.steps?.toLocaleString() || 0}
        </div>

        {/* 4. Сон */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase mb-1">Сон</p>
          {lastLog?.sleep_hours || 0} ч
        </div>

        {/* 5. Вода */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase mb-1">Вода</p>
          {lastLog?.water ? `${(lastLog.water / 1000).toFixed(1)} л` : "0 л"}
        </div>

        {/* 6. Вес */}
        <div>
          <p className="text-[10px] text-slate-400 uppercase mb-1">Вес</p>
          {lastLog?.weight || "—"} кг
        </div>
      </div>
    </div>
  );
}

export default memo(StudentCard);
