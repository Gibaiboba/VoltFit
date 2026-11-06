import React from "react";
import { Info, Play } from "lucide-react";

interface WorkoutHeaderProps {
  isTimerStarted: boolean;
  customWorkoutName?: string;
  totalVolumeLoad: number;
  liveBurnedCalories: number;
  formattedTime: string;
  onStartTimer: () => void;
}

export const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  isTimerStarted,
  customWorkoutName,
  totalVolumeLoad,
  liveBurnedCalories,
  formattedTime,
  onStartTimer,
}) => {
  if (!isTimerStarted) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-[32px] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-md inline-flex items-center gap-1">
            <Info size={10} /> Режим подготовки
          </span>
          <h3 className="text-2xl font-black uppercase tracking-tight">
            {customWorkoutName || "Новый комплекс"}
          </h3>
          <p className="text-xs text-blue-100 font-medium">
            Проверьте состав упражнений, настройте стартовые веса и нажмите
            кнопку старта для активации таймеров.
          </p>
        </div>
        <button
          onClick={onStartTimer}
          className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-900/20 w-full md:w-auto justify-center shrink-0 border-b-4 border-emerald-700 active:border-b-0 active:mt-1"
        >
          <Play size={16} fill="currentColor" /> Начать тренировку
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-0 bg-slate-50 pt-2 pb-4 z-40 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200/50">
      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col justify-center shadow-md">
        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
          Текущий объём
        </span>
        <div className="text-3xl font-black italic mt-0.5 text-blue-400">
          {totalVolumeLoad}{" "}
          <span className="text-xs not-italic text-slate-400">кг</span>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col justify-center shadow-md">
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
          Энергорасход
        </span>
        <div className="text-3xl font-black italic mt-0.5 text-emerald-400">
          {liveBurnedCalories}{" "}
          <span className="text-xs not-italic text-slate-400">ккал</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col justify-center shadow-sm">
        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">
          Время тренировки
        </span>
        <div className="text-3xl font-black italic mt-0.5 text-blue-700 tracking-wider">
          {formattedTime}
        </div>
      </div>
    </div>
  );
};
