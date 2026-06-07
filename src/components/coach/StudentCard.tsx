"use client";
import { memo, useMemo } from "react";
import { StudentView } from "@/types/coach";
import { ACTIVITIES_MAP } from "@/constants/activities";
import { LoggedActivity } from "@/hooks/use-student-dashboard/types";

interface StudentCardProps {
  item: StudentView;
  weeklySteps: number;
  onClick: (student: StudentView) => void;
}

// Динамический подбор стилей на основе сгенерированной сводки тренировок
const getActivityStyle = (activityName?: string) => {
  if (!activityName || activityName === "День без тренировок") {
    return "bg-slate-100 text-slate-500 border-slate-200";
  }

  const lower = activityName.toLowerCase();

  if (
    lower.includes("силов") ||
    lower.includes("тяжел") ||
    lower.includes("кроссфит")
  ) {
    return "bg-red-100 text-red-600 border-red-200";
  }

  if (
    lower.includes("бег") ||
    lower.includes("плаван") ||
    lower.includes("вело") ||
    lower.includes("сайкл")
  ) {
    return "bg-orange-100 text-orange-600 border-orange-200";
  }

  if (
    lower.includes("йога") ||
    lower.includes("растяж") ||
    lower.includes("аэроб") ||
    lower.includes("танц")
  ) {
    return "bg-purple-100 text-purple-600 border-purple-200";
  }

  return "bg-blue-100 text-blue-600 border-blue-200";
};

function StudentCard({ item, weeklySteps, onClick }: StudentCardProps) {
  const lastLog = item.student.daily_logs?.[0];

  // Генерируем красивую строку названий тренировок на лету из JSONB массива
  const computedActivityName = useMemo(() => {
    const logActivities = lastLog?.activities || [];
    if (logActivities.length === 0) return "День без тренировок";

    return logActivities
      .map((a: LoggedActivity) => {
        const config = ACTIVITIES_MAP[a.activity_id];
        // Вырезаем эмодзи для аккуратности отображения в карточке тренера
        return config
          ? config.name.split(" ").slice(1).join(" ")
          : "Тренировка";
      })
      .join(", ");
  }, [lastLog?.activities]);

  const handleCardClick = () => {
    onClick(item);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer group"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-50 gap-4">
        <div>
          <p className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">
            {item.student.full_name}
          </p>

          <span
            className={`inline-block px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-lg border ${getActivityStyle(computedActivityName)}`}
          >
            {computedActivityName}
          </span>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
            Последний отчет:
          </p>
          <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full">
            {lastLog?.log_date || "—"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 text-sm font-bold text-slate-700">
        <div>
          <p className="text-[10px] text-slate-400 uppercase mb-1">Вес</p>
          ⚖️ {lastLog?.weight || "—"} кг
        </div>
        <div className="border-l border-slate-100 pl-4">
          <p className="text-[10px] text-slate-400 uppercase mb-1">Ккал</p>
          🔥 {lastLog?.calories || 0}
        </div>

        <div className="border-l border-slate-100 pl-4 col-span-2 sm:col-span-1">
          <p className="text-[10px] text-slate-400 uppercase mb-1">Б / Ж / У</p>
          <div className="flex gap-1 text-[11px]">
            <span className="text-blue-600">{lastLog?.proteins || 0}</span>
            <span className="text-slate-300">/</span>
            <span className="text-orange-500">{lastLog?.fats || 0}</span>
            <span className="text-slate-300">/</span>
            <span className="text-emerald-500">{lastLog?.carbs || 0}</span>
          </div>
        </div>

        <div className="border-l border-slate-100 pl-4">
          <p className="text-[10px] text-slate-400 uppercase mb-1">Сон</p>
          🌙 {lastLog?.sleep_hours || 0}ч
        </div>

        <div className="border-l border-slate-100 pl-4">
          <p className="text-[10px] text-slate-400 uppercase mb-1">Вода</p>
          💧 {lastLog?.water ? `${(lastLog.water / 1000).toFixed(1)}л` : "0л"}
        </div>

        <div className="border-l border-slate-100 pl-4">
          <p className="text-[10px] text-slate-400 uppercase mb-1">Шаги</p>
          👣 {lastLog?.steps?.toLocaleString() || 0}
        </div>

        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 col-span-2 sm:col-span-1">
          <p className="text-[10px] text-blue-400 uppercase mb-1 font-black">
            7 дней
          </p>
          <span className="text-blue-600 font-black">
            {weeklySteps.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(StudentCard);
