"use client";

import {
  Dumbbell,
  Plus,
  Play,
  RotateCcw,
  Activity,
  Trash2,
  Award,
  Sparkles,
  MessageSquareQuote,
  History,
} from "lucide-react";
import {
  FitnessProfile,
  WorkoutExercise,
  WorkoutTemplate,
  AssignedProgram,
} from "@/types/workout";
import Link from "next/link";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";

interface WorkoutDashboardProps {
  fitnessProfile: FitnessProfile;
  userGlobalGoal: string;
  energyLevel?: string;
  setIsCustomWorkoutActive: (active: boolean) => void;
  setIsActiveSessionActive?: (active: boolean) => void;
  setSelectedExercises?: (exercises: WorkoutExercise[]) => void;
  setCustomWorkoutName?: (name: string) => void;
  resetFitnessOptions: () => void;
  assignedProgram?: AssignedProgram | null;
  recommendedWorkouts?: WorkoutTemplate[];
  savedTemplates?: WorkoutTemplate[];
  onDeleteTemplate?: (templateId: string) => void;
}

const PLACE_LABELS: Record<string, string> = {
  home: "Дом",
  gym: "Тренажёрный зал",
  street: "Уличная площадка",
  mixed: "Комбинированный",
};

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Снижение веса",
  gain_muscle: "Набор мышечной массы",
  maintain: "Тонус и здоровье",
};

export default function WorkoutDashboard({
  fitnessProfile,
  energyLevel,
  userGlobalGoal,
  setIsCustomWorkoutActive,
  resetFitnessOptions,
  assignedProgram = null,
  recommendedWorkouts = [],
  savedTemplates = [],
  onDeleteTemplate,
}: WorkoutDashboardProps) {
  // Подключаем глобальный стор активной тренировки для мгновенного запуска
  const startWorkoutSession = useActiveWorkoutStore(
    (state) => state.startWorkoutSession,
  );

  // Быстрый старт пустой тренировки (на ходу)
  const handleLaunchEmptyWorkout = () => {
    startWorkoutSession("Быстрая тренировка", []);
  };

  // Запуск любого готового комплекса (от тренера, автоподбор или свой шаблон)
  const handleLaunchWorkout = (workout: WorkoutTemplate) => {
    const preparedExercises = (workout.exercises || []).map((ex) => ({
      ...ex,
      sets: (ex.sets || []).map((set) => ({ ...set, done: false })),
    }));

    startWorkoutSession(workout.name, preparedExercises);
  };

  const rawPlace = (fitnessProfile.answers?.training_place as string) || "home";
  const placeLabel = PLACE_LABELS[rawPlace] || "Дом";
  const goalLabel = GOAL_LABELS[userGlobalGoal] || "Тонус и здоровье";

  return (
    <div className="space-y-8 text-left">
      {/* ШАПКА РАЗДЕЛА */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2 break-words">
            <Dumbbell className="text-blue-600 shrink-0" size={28} />
            <span>Программа тренировок</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1.5">
            Локация:{" "}
            <span className="text-blue-600 font-black uppercase">
              {placeLabel}
            </span>{" "}
            • Цель:{" "}
            <span className="text-slate-700 font-bold uppercase">
              {goalLabel}
            </span>
          </p>
        </div>

        {/* Кнопки быстрого старта и конструктора */}
        {/* Кнопки истории, быстрого старта и конструктора */}
        <div className="flex flex-wrap gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/student/workouts/history"
            className="px-4 h-12 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <History size={15} className="text-slate-500" /> История
          </Link>

          <button
            type="button"
            onClick={handleLaunchEmptyWorkout}
            className="flex-1 sm:flex-initial px-4 sm:px-5 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 cursor-pointer"
          >
            <Activity size={15} /> Пустая тренировка
          </button>

          <button
            type="button"
            onClick={() => setIsCustomWorkoutActive(true)}
            className="flex-1 sm:flex-initial px-4 sm:px-5 h-12 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus size={15} /> Создать шаблон
          </button>
        </div>
      </div>

      {/* УВЕДОМЛЕНИЕ ОБ УТОМЛЯЕМОСТИ */}
      {energyLevel === "tired" && (
        <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl flex items-start gap-3">
          <span className="text-lg mt-0.5 shrink-0">⚠️</span>
          <p className="text-xs font-bold text-blue-900/80 leading-relaxed">
            Выявлена повышенная утомляемость. Время отдыха между подходами
            автоматически увеличено, а осевые нагрузки снижены для бережного
            восстановления.
          </p>
        </div>
      )}

      {/* СЕКЦИЯ 1. ПРОГРАММА ОТ ТРЕНЕРА (ИЗ ТАБЛИЦЫ assigned_programs) */}
      {assignedProgram && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Award size={16} className="text-amber-500" />
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-600">
              Персональный план от тренера • {assignedProgram.program_name}
            </h2>
          </div>

          {assignedProgram.coach_notes && (
            <div className="p-4 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-3">
              <MessageSquareQuote
                size={18}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <p className="text-xs font-medium text-amber-900 leading-relaxed">
                {assignedProgram.coach_notes}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {assignedProgram.workouts?.map((workout, idx) => (
              <div
                key={workout.id || idx}
                className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full"
              >
                <div className="space-y-1.5 w-full min-w-0 flex-1">
                  <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 text-[9px] font-black uppercase tracking-widest rounded-md inline-block">
                    Назначено тренером • {workout.exercises?.length || 0} упр.
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tight break-words">
                    {workout.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-300 truncate w-full">
                    {workout.exercises?.map((e) => e.title).join(", ") ||
                      "Состав уточняется"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchWorkout(workout)}
                  className="h-12 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors w-full md:w-auto justify-center shrink-0 cursor-pointer"
                >
                  <Play size={13} fill="currentColor" /> Начать
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {/* СЕКЦИЯ 2. АВТО-ПОДБОР ПОД АНКЕТУ И ЦЕЛЬ */}
      {recommendedWorkouts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles size={15} className="text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
              Рекомендовано под вашу анкету
            </h2>
          </div>

          <div className="space-y-3">
            {recommendedWorkouts.map((workout, idx) => (
              <div
                key={idx}
                className="bg-white p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full"
              >
                <div className="space-y-1.5 w-full min-w-0 flex-1">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-md inline-block">
                    Авто-подбор • {workout.exercises?.length || 0} упр. • ~
                    {(fitnessProfile.answers?.schedule_duration as string) ||
                      "45"}{" "}
                    мин
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight break-words">
                    {workout.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 truncate w-full">
                    {workout.exercises?.map((e) => e.title).join(", ")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchWorkout(workout)}
                  className="h-12 px-6 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors w-full md:w-auto justify-center shrink-0 cursor-pointer"
                >
                  <Play size={12} fill="currentColor" /> Запустить
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* СЕКЦИЯ 3. ЛИЧНЫЕ ШАБЛОНЫ ПОЛЬЗОВАТЕЛЯ */}
      {savedTemplates.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
            Мои сохранённые шаблоны
          </h2>

          <div className="space-y-3">
            {savedTemplates.map((template, idx) => (
              <div
                key={template.id || idx}
                className="bg-white p-5 sm:p-6 rounded-[28px] sm:rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full"
              >
                <div className="space-y-1.5 w-full min-w-0 flex-1">
                  <span className="px-2.5 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded-md inline-block">
                    Ваш Шаблон • {template.exercises?.length || 0} упр.
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight break-words">
                    {template.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 truncate w-full">
                    {template.exercises?.map((e) => e.title).join(", ") ||
                      "Нет упражнений"}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleLaunchWorkout(template)}
                    className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors flex-1 md:flex-initial justify-center cursor-pointer"
                  >
                    <Play size={12} fill="currentColor" /> Запустить
                  </button>

                  {onDeleteTemplate && template.id && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(`Удалить шаблон "${template.name}"?`)
                        ) {
                          onDeleteTemplate(template.id!);
                        }
                      }}
                      className="h-12 w-12 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      title="Удалить шаблон"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* КНОПКА ПЕРЕПРОХОЖДЕНИЯ ОНБОРДИНГА */}
      <div className="pt-2">
        <button
          type="button"
          onClick={resetFitnessOptions}
          className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} /> Изменить параметры анкеты (Локация / Инвентарь
          / Здоровье)
        </button>
      </div>
    </div>
  );
}
