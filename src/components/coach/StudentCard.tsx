"use client";
import { memo } from "react";
import { StudentView } from "@/types/coach";

interface StudentCardProps {
  item: StudentView;
  weeklySteps: number;
  onClick: (student: StudentView) => void;
}

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

function StudentCard({ item, weeklySteps, onClick }: StudentCardProps) {
  const lastLog = item.student.daily_logs?.[0];

  //стабильный обработчик внутри
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
            className={`inline-block px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-lg border ${getActivityStyle(lastLog?.activity_level)}`}
          >
            {lastLog?.activity_level || "Нет данных"}
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

        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
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

// Экспортируем мемоизированный компонент
export default memo(StudentCard);
