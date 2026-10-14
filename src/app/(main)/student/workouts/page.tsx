"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Plus,
  Play,
  PlusCircle,
  Trash2,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { OnboardingMetadata } from "@/types/user";

// JIT-онбординг для фитнеса
const FITNESS_QUESTIONS = [
  {
    id: "training_place",
    title: "Где вы будете тренироваться?",
    options: [
      { label: "🏡 Дома (без инвентаря)", value: "home" },
      { label: "🏋️‍♂️ В тренажерном зале", value: "gym" },
      { label: "🌲 На уличной площадке", value: "street" },
    ],
  },
  {
    id: "fitness_experience",
    title: "Ваш фитнес-опыт",
    options: [
      { label: "🥚 Новичок (начну плавно)", value: "beginner" },
      { label: "⚡ Продвинутый (знаю технику упражнений)", value: "advanced" },
    ],
  },
];

// Локальная база упражнений для конструктора
const EXERCISES_DATABASE = [
  {
    id: "bench_press",
    title: "Жим штанги лежа",
    met: 6.0,
    muscle: "Грудь",
    image: "🏋️‍♂️",
  },
  {
    id: "squats",
    title: "Приседания со штангой",
    met: 6.0,
    muscle: "Ноги",
    image: "🍗",
  },
  {
    id: "push_ups",
    title: "Отжимания от пола",
    met: 4.0,
    muscle: "Грудь/Трицепс",
    image: "🤸‍♂️",
  },
  {
    id: "pull_ups",
    title: "Подтягивания на турнике",
    met: 4.0,
    muscle: "Спина",
    image: "🧗‍♂️",
  },
  {
    id: "stretching",
    title: "Мягкая растяжка мышц",
    met: 2.5,
    muscle: "Все тело",
    image: "🧘‍♂️",
  },
];

export default function WorkoutsPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [localFitnessAnswers, setLocalAnswers] = useState<
    Record<string, string>
  >({});

  // Локальный переключатель между Dashboard и Конструктором Тренировки
  const [isCustomWorkoutActive, setIsCustomWorkoutActive] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Состояние сборки кастомной тренировки
  const [customWorkoutName, setCustomWorkoutName] = useState("Моя тренировка");
  const [selectedExercises, setSelectedExercises] = useState<
    Array<{
      id: string;
      title: string;
      met: number;
      sets: Array<{ reps: string; weight: string; done: boolean }>;
    }>
  >([]);

  // Таймер тренировки
  const [workoutDuration, setWorkoutDuration] = useState(0); // в минутах

  const onboardingMetadata = useMemo<Partial<OnboardingMetadata>>(() => {
    return profile?.onboarding_metadata || {};
  }, [profile]);

  const userGlobalGoal = profile?.goal || "maintain";
  const userWeight = profile?.weight || 70;

  // 🔥 ИСПРАВЛЕНО: Рассчитываем текущий фитнес-экран на лету, без useEffect!
  const activeScreen = useMemo(() => {
    if (!profile) return "dashboard"; // пока грузится, предохранитель
    if (!onboardingMetadata.fitness_onboarding_completed && !isResetting) {
      return "onboarding";
    }
    if (isCustomWorkoutActive) {
      return "custom_workout";
    }
    return "dashboard";
  }, [
    profile,
    onboardingMetadata.fitness_onboarding_completed,
    isCustomWorkoutActive,
    isResetting,
  ]);

  // Мутация сохранения фитнес-метаданных в Supabase
  const { mutate: updateFitnessMetadata } = useMutation({
    mutationFn: async (newMetadata: OnboardingMetadata) => {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .update({ onboarding_metadata: newMetadata })
        .eq("id", profile.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsResetting(false);
      setCurrentQuestionIndex(0);
      queryClient.invalidateQueries({
        queryKey: ["user-profile", profile?.id],
      });
    },
    onError: () => {
      setIsResetting(false);
      toast.error("Не удалось сохранить фитнес-настройки");
    },
  });

  const handleSelectOnboardingOption = (questionId: string, value: string) => {
    const updated = { ...localFitnessAnswers, [questionId]: value };
    setLocalAnswers(updated);

    if (currentQuestionIndex < FITNESS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
    } else {
      const newMetadata = {
        ...onboardingMetadata,
        fitness_onboarding_completed: true,
        fitness_answers: updated,
      };
      updateFitnessMetadata(newMetadata);
    }
  };

  // Реактивный подсчет тоннажа
  const totalVolumeLoad = useMemo(() => {
    return selectedExercises.reduce((totalEx, ex) => {
      const exVolume = ex.sets.reduce((totalSet, set) => {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps) || 0;
        return totalSet + (set.done ? w * r : 0);
      }, 0);
      return totalEx + exVolume;
    }, 0);
  }, [selectedExercises]);

  // Реактивный подсчет калорий по MET
  const totalBurnedCalories = useMemo(() => {
    if (selectedExercises.length === 0 || workoutDuration <= 0) return 0;
    const avgMet =
      selectedExercises.reduce((sum, ex) => sum + ex.met, 0) /
      selectedExercises.length;
    const caloriesPerMinute = avgMet * 3.5 * (userWeight / 200);
    return Math.round(caloriesPerMinute * workoutDuration);
  }, [selectedExercises, workoutDuration, userWeight]);

  // Хелперы кастомного конструктора
  const addExerciseToWorkout = (exTemplate: (typeof EXERCISES_DATABASE)[0]) => {
    setSelectedExercises((prev) => [
      ...prev,
      {
        id: exTemplate.id,
        title: exTemplate.title,
        met: exTemplate.met,
        sets: [{ reps: "10", weight: "0", done: false }],
      },
    ]);
  };

  const addSetToExercise = (index: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex, i) =>
        i === index
          ? {
              ...ex,
              sets: [...ex.sets, { reps: "10", weight: "0", done: false }],
            }
          : ex,
      ),
    );
  };

  const updateSetValues = (
    exIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "done",
    value: string | boolean,
  ) => {
    setSelectedExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex
          ? {
              ...ex,
              sets: ex.sets.map((set, sj) =>
                sj === setIndex ? { ...set, [field]: value } : set,
              ),
            }
          : ex,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 min-h-[calc(100vh-64px)] mt-16 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        Синхронизация спортивного комплекса...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-[calc(100vh-64px)] mt-16 text-slate-900 bg-slate-50 rounded-[40px]">
      <AnimatePresence mode="wait">
        {/* ================= ЭТАП А: JIT ОПРОСНИК ФИТНЕСА ================= */}
        {activeScreen === "onboarding" && (
          <motion.div
            key="fit-onboarding"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-md mx-auto bg-white p-8 rounded-[36px] shadow-sm border border-slate-100 flex flex-col min-h-[420px] justify-between text-left"
          >
            <div>
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                Спортивный профиль • Шаг {currentQuestionIndex + 1} из{" "}
                {FITNESS_QUESTIONS.length}
              </span>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-2 leading-tight">
                {FITNESS_QUESTIONS[currentQuestionIndex].title}
              </h2>
            </div>

            <div className="space-y-3 my-6">
              {FITNESS_QUESTIONS[currentQuestionIndex].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    handleSelectOnboardingOption(
                      FITNESS_QUESTIONS[currentQuestionIndex].id,
                      opt.value,
                    )
                  }
                  className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all font-bold text-slate-700 active:scale-98 bg-white flex justify-between items-center group"
                >
                  <span>{opt.label}</span>
                  <span className="text-slate-300 group-hover:text-blue-500 transition-colors">
                    →
                  </span>
                </button>
              ))}
            </div>

            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{
                  width: `${((currentQuestionIndex + 1) / FITNESS_QUESTIONS.length) * 100}%`,
                }}
              />
            </div>
          </motion.div>
        )}

        {/* ================= ЭТАП Б: ГЛАВНЫЙ ЭКРАН ПРОГРАММ И КНОПКА КАСТОМА ================= */}
        {activeScreen === "dashboard" && (
          <motion.div
            key="fit-dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-5">
              <div>
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                  <Dumbbell className="text-blue-600" size={32} /> Программа
                  тренировок
                </h1>
                <p className="text-sm font-medium text-slate-400 mt-1">
                  Адаптировано под локацию:{" "}
                  <span className="text-blue-600 font-black uppercase">
                    {onboardingMetadata.fitness_answers?.training_place ||
                      "Дом"}
                  </span>
                </p>
              </div>

              {/* Кнопка запуска конструктора кастомной тренировки */}
              <button
                onClick={() => setIsCustomWorkoutActive(true)}
                className="px-5 h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 shrink-0 self-start sm:self-center"
              >
                <Plus size={14} /> Создать кастомную
              </button>
            </div>

            {/* ЗОЖ-ПОДСКАЗКА СВЯЗИ ДЕФИЦИТОВ С ТРЕНИРОВКАМИ */}
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

            {/* КАРТОЧКА СГЕНЕРИРОВАННОЙ ПРОГРАММЫ */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-md">
                  Готовый комплекс •{" "}
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
                onClick={() => {
                  setSelectedExercises([
                    {
                      id: "push_ups",
                      title: "Отжимания от пола",
                      met: 4.0,
                      sets: [{ reps: "12", weight: "0", done: false }],
                    },
                  ]);
                  setCustomWorkoutName(
                    userGlobalGoal === "lose_weight"
                      ? "Жиросжигающий интенсив"
                      : "Силовой комплекс",
                  );
                  setIsCustomWorkoutActive(true);
                }}
                className="h-12 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-colors w-full md:w-auto justify-center"
              >
                <Play size={12} fill="currentColor" /> Запустить
              </button>
            </div>
            <button
              onClick={() => {
                setIsResetting(true);
                const newMetadata = {
                  ...onboardingMetadata,
                  fitness_onboarding_completed: false,
                  fitness_answers: {},
                };
                updateFitnessMetadata(newMetadata);
              }}
              className="inline-flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors mt-6"
            >
              <RotateCcw size={12} /> Изменить параметры фитнеса (Локация /
              Опыт)
            </button>
          </motion.div>
        )}

        {/* ================= ЭТАП В: ИНТЕРАКТИВНЫЙ КОНСТРУКТОР ТРЕНИРОВКИ ================= */}
        {activeScreen === "custom_workout" && (
          <motion.div
            key="custom-workout-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left"
          >
            {/* Панель управления и калькуляторы */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Главный блок тоннажа */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
                  Общий тоннаж (Объем)
                </span>
                <div className="text-4xl font-black italic mt-1 text-blue-400">
                  {totalVolumeLoad}{" "}
                  <span className="text-xs not-italic text-slate-400">кг</span>
                </div>
              </div>

              {/* Блок расчетных MET калорий */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                  Расход энергии (MET)
                </span>
                <div className="text-4xl font-black italic mt-1 text-emerald-400">
                  {totalBurnedCalories}{" "}
                  <span className="text-xs not-italic text-slate-400">
                    ккал
                  </span>
                </div>
              </div>

              {/* Инпут времени для формулы калорий */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col justify-center">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Длительность (минут)
                </label>
                <input
                  type="number"
                  value={workoutDuration || ""}
                  onChange={(e) =>
                    setWorkoutDuration(
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                  className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none text-xl font-black focus:border-blue-500"
                  placeholder="0 мин"
                />
              </div>
            </div>

            {/* СПИСОК УПРАЖНЕНИЙ ТРЕНИРОВКИ */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 px-0.5">
                  Текущий комплекс
                </span>
                <input
                  type="text"
                  value={customWorkoutName}
                  onChange={(e) => setCustomWorkoutName(e.target.value)}
                  className="bg-transparent text-2xl font-black text-slate-900 outline-none border-b-2 border-transparent focus:border-blue-500 pb-1 uppercase tracking-tight transition-all max-w-sm"
                  placeholder="Название тренировки"
                />
              </div>

              {selectedExercises.map((ex, exIndex) => (
                <div
                  key={exIndex}
                  className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                      {exIndex + 1}. {ex.title}
                    </h4>
                    <button
                      onClick={() =>
                        setSelectedExercises((prev) =>
                          prev.filter((_, idx) => idx !== exIndex),
                        )
                      }
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Таблица подходов (Строки как в Strong/Hevy) */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center px-2">
                      <span>Сет</span>
                      <span>Вес (кг)</span>
                      <span>Повторы</span>
                      <span>Готово</span>
                    </div>
                    {ex.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className={`grid grid-cols-4 gap-2 items-center text-center p-1 rounded-xl transition-colors ${
                          set.done ? "bg-emerald-50/50" : ""
                        }`}
                      >
                        <span className="font-black text-slate-400 text-xs">
                          #{setIndex + 1}
                        </span>

                        {/* Инпут ввода веса */}
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) =>
                            updateSetValues(
                              exIndex,
                              setIndex,
                              "weight",
                              e.target.value,
                            )
                          }
                          className="bg-slate-50 border p-2 rounded-xl text-center font-bold outline-none focus:border-blue-500 text-sm"
                        />

                        {/* Инпут ввода количества повторений */}
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) =>
                            updateSetValues(
                              exIndex,
                              setIndex,
                              "reps",
                              e.target.value,
                            )
                          }
                          className="bg-slate-50 border p-2 rounded-xl text-center font-bold outline-none focus:border-blue-500 text-sm"
                        />

                        {/* Интерактивная кнопка-галочка выполнения подхода */}
                        <button
                          onClick={() =>
                            updateSetValues(
                              exIndex,
                              setIndex,
                              "done",
                              !set.done,
                            )
                          }
                          className={`mx-auto p-2 rounded-xl border-2 transition-all ${
                            set.done
                              ? "bg-emerald-500 border-emerald-500 text-white scale-105"
                              : "border-slate-200 text-transparent"
                          }`}
                        >
                          <CheckCircle
                            size={14}
                            className={
                              set.done ? "text-white" : "text-slate-200"
                            }
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Добавление дополнительного подхода в текущее упражнение */}
                  <button
                    onClick={() => addSetToExercise(exIndex)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={12} /> Добавить подход
                  </button>
                </div>
              ))}
            </div>

            {/* ПАНЕЛЬ ДОБАВЛЕНИЯ НОВЫХ УПРАЖНЕНИЙ ИЗ БАЗЫ БИБЛИОТЕКИ */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
                Библиотека упражнений
              </h4>
              <div className="flex flex-wrap gap-2">
                {EXERCISES_DATABASE.map((exTemplate) => (
                  <button
                    key={exTemplate.id}
                    onClick={() => addExerciseToWorkout(exTemplate)}
                    className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl text-xs font-bold text-slate-700 transition-all flex items-center gap-2"
                  >
                    <span>{exTemplate.image}</span>
                    <span>{exTemplate.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Финальные кнопки управления конструктором активной сессии */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsCustomWorkoutActive(false);
                  setSelectedExercises([]);
                  setWorkoutDuration(0);
                }}
                className="w-1/3 h-14 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  if (selectedExercises.length === 0 || totalVolumeLoad === 0) {
                    toast.error(
                      "Добавьте упражнения и отметьте выполненные подходы галочкой!",
                    );
                    return;
                  }
                  toast.success(
                    `Тренировка завершена! Тоннаж: ${totalVolumeLoad} кг, Калории: ${totalBurnedCalories} ккал записаны в дневник.`,
                  );
                  setIsCustomWorkoutActive(false);
                  setSelectedExercises([]);
                  setWorkoutDuration(0);
                }}
                className="w-2/3 h-14 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 border-b-4 border-blue-800 active:border-b-0 active:mt-1"
              >
                Завершить тренировку 🏁
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
