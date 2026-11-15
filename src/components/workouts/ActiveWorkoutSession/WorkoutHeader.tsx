import React from "react";
import { Info, Play, ChevronDown, X } from "lucide-react";

interface WorkoutHeaderProps {
  isTimerStarted: boolean;
  customWorkoutName?: string;
  totalVolumeLoad: number;
  liveBurnedCalories: number;
  formattedTime: string;
  onStartTimer: () => void;
  onMinimize: () => void;
  onCancel: () => void;
}

export const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  isTimerStarted,
  customWorkoutName,
  totalVolumeLoad,
  liveBurnedCalories,
  formattedTime,
  onStartTimer,
  onMinimize,
  onCancel,
}) => {
  const handleConfirmCancel = () => {
    if (
      window.confirm(
        "Закрыть и прервать тренировку? Текущие данные не будут сохранены.",
      )
    ) {
      onCancel();
    }
  };

  if (!isTimerStarted) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-[32px] shadow-xl flex flex-col gap-5 relative">
        {/* Верхняя строка: бейдж слева, кнопки управления справа */}
        <div className="flex items-center justify-between gap-4">
          <span className="px-2.5 py-1 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-md inline-flex items-center gap-1">
            <Info size={10} /> Режим подготовки
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMinimize}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Свернуть в плашку"
            >
              <ChevronDown size={14} /> Свернуть
            </button>

            <button
              type="button"
              onClick={handleConfirmCancel}
              className="p-1.5 bg-white/15 hover:bg-red-500/80 text-white rounded-xl transition-colors cursor-pointer"
              title="Закрыть тренировку"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Основной контент шапки */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <h3 className="text-2xl font-black uppercase tracking-tight">
              {customWorkoutName || "Новый комплекс"}
            </h3>
            <p className="text-xs text-blue-100 font-medium">
              Проверьте состав упражнений, настройте стартовые веса и нажмите
              кнопку старта для активации таймеров.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartTimer}
            className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-900/20 w-full md:w-auto justify-center shrink-0 border-b-4 border-emerald-700 active:border-b-0 active:mt-1 cursor-pointer"
          >
            <Play size={16} fill="currentColor" /> Начать тренировку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 bg-slate-50 pt-2 pb-4 z-40 space-y-3 border-b border-slate-200/50">
      {/* Компактная панель управления в липкой шапке */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Живая сессия
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMinimize}
            className="px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ChevronDown size={14} /> Свернуть
          </button>

          <button
            type="button"
            onClick={handleConfirmCancel}
            className="p-1.5 bg-slate-200/80 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-xl transition-colors cursor-pointer"
            title="Закрыть и прервать тренировку"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Сетка метрик */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
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
    </div>
  );
};
