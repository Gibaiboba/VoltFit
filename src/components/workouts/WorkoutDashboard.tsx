"use client";

import {
  Dumbbell,
  Plus,
  Play,
  RotateCcw,
  Activity,
  Trash2,
} from "lucide-react";
import {
  OnboardingMetadata,
  WorkoutExercise,
  WorkoutTemplate,
} from "@/types/workout";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";

interface WorkoutDashboardProps {
  onboardingMetadata: Partial<OnboardingMetadata>;
  userGlobalGoal: string;
  setIsCustomWorkoutActive: (active: boolean) => void;
  setIsActiveSessionActive: (active: boolean) => void;
  setSelectedExercises: (exercises: WorkoutExercise[]) => void;
  setCustomWorkoutName: (name: string) => void;
  resetFitnessOptions: () => void;
  savedTemplates?: WorkoutTemplate[];
  onDeleteTemplate?: (templateId: string) => void;
}

export default function WorkoutDashboard({
  onboardingMetadata,
  userGlobalGoal,
  setIsCustomWorkoutActive,
  setIsActiveSessionActive,
  setSelectedExercises,
  setCustomWorkoutName,
  resetFitnessOptions,
  onDeleteTemplate,
  savedTemplates = [], // По умолчанию пустой массив, если шаблонов еще нет
}: WorkoutDashboardProps) {
  const startWorkoutSession = useActiveWorkoutStore(
    (s) => s.startWorkoutSession,
  );

  // Быстрый запуск базового комплекса (сразу отправляет в плеер)
  const handleLaunchDefaultWorkout = () => {
    setSelectedExercises([
      {
        id: "push_ups",
        title: "Отжимания от пола",
        met: 4.0,
        sets: [{ reps: "12", weight: "0", done: false }],
        rest_time: 90,
      },
    ]);
    setCustomWorkoutName(
      userGlobalGoal === "lose_weight"
        ? "Жиросжигающий интенсив"
        : "Силовой комплекс",
    );
    setIsActiveSessionActive(true); // Запуск плеера тренировки
  };

  // Быстрый старт пустой тренировки (на ходу)
  const handleLaunchEmptyWorkout = () => {
    setSelectedExercises([]);
    setCustomWorkoutName("Быстрая тренировка");
    setIsActiveSessionActive(true); // Запуск плеера тренировки
  };

  // Запуск конкретного кастомного шаблона
  const handleLaunchTemplate = (template: WorkoutTemplate) => {
    const preparedExercises = template.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((set) => ({ ...set, done: false })),
    }));
    startWorkoutSession(template.name, preparedExercises);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2 break-words">
            <Dumbbell className="text-blue-600 shrink-0" size={28} />
            <span>Тренировки</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Локация:{" "}
            <span className="text-blue-600 font-black uppercase">
              {onboardingMetadata.fitness_answers?.training_place || "Дом"}
            </span>
          </p>
        </div>

        {/* Разделенные кнопки управления */}
        <div className="flex flex-wrap gap-2 shrink-0 self-start sm:self-center">
          <button
            onClick={handleLaunchEmptyWorkout}
            className="px-5 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
          >
            <Activity size={14} /> Начать тренировку
          </button>

          <button
            onClick={() => setIsCustomWorkoutActive(true)}
            className="px-5 h-12 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={14} /> Создать шаблон
          </button>
        </div>
      </div>

      {onboardingMetadata.energy_level === "tired" && (
        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
          <span className="text-lg mt-0.5">⚠️</span>
          <p className="text-xs font-bold text-blue-900/80 leading-relaxed">
            Внимание: из анкеты ЗОЖ выявлена повышенная утомляемость. Мы
            временно ограничили тяжелые силовые упражнения. Сегодня
            рекомендуется легкий тонус, кардио или стретчинг.
          </p>
        </div>
      )}
      {/* СПИСОК ДОСТУПНЫХ КОМПЛЕКСОВ И ШАБЛОНОВ */}
      <div className="space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
          Доступные комплексы планов
        </h4>

        {/* 1. Дефолтный системный комплекс на основе целей */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-md">
              Рекомендация •{" "}
              {onboardingMetadata.fitness_answers?.training_place === "gym"
                ? "30-45 мин"
                : "15 мин"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {userGlobalGoal === "lose_weight"
                ? "Жиросжигающий интенсив"
                : userGlobalGoal === "gain_muscle"
                  ? "Силовой сплит на массу"
                  : "Мягкий тонус и гибкость"}
            </h3>
            <p className="text-xs font-medium text-slate-400">
              {onboardingMetadata.fitness_answers?.fitness_experience ===
              "beginner"
                ? "Уровень сложности: Для новичков"
                : "Уровень сложности: Продвинутый"}
            </p>
          </div>
          <button
            onClick={handleLaunchDefaultWorkout}
            className="h-12 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-colors w-full md:w-auto justify-center"
          >
            <Play size={12} fill="currentColor" /> Запустить
          </button>
        </div>

        {/* 2. Кастомные шаблоны, которые пользователь создал сам */}
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
                onClick={() => handleLaunchTemplate(template)}
                className="h-12 px-6 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 transition-colors flex-1 md:flex-initial justify-center cursor-pointer"
              >
                <Play size={12} fill="currentColor" /> Запустить
              </button>

              {onDeleteTemplate && template.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Удалить шаблон "${template.name}"?`)) {
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

      {/* Кнопка сброса параметров фитнеса */}
      <button
        onClick={resetFitnessOptions}
        className="inline-flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors mt-6 block"
      >
        <RotateCcw size={12} /> Изменить параметры фитнеса (Локация / Опыт)
      </button>
    </div>
  );
}
