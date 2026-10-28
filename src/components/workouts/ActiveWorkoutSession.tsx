"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Trash2,
  PlusCircle,
  CheckCircle,
  Timer,
  Play,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { EXERCISES_DATABASE } from "@/constants/workout/exerciseData";
import { ActiveWorkoutSessionProps } from "@/types/workout";

// Расширяем ваши типы пропсом userWeight, который мы передаем из метаданных страницы
interface EnhancedActiveWorkoutProps extends ActiveWorkoutSessionProps {
  userWeight: number;
}

export default function ActiveWorkoutSession({
  customWorkoutName,
  selectedExercises,
  totalVolumeLoad,
  userWeight,
  updateSetValues,
  addSetToExercise,
  removeExerciseFromWorkout,
  addExerciseToWorkout,
  finishActiveWorkout,
  cancelWorkout,
}: EnhancedActiveWorkoutProps) {
  // Флаг запуска тренировки: теперь по умолчанию false
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);

  // Секундомер тренировки: тикает ТОЛЬКО если тренировка запущена
  useEffect(() => {
    if (!isTimerStarted) return;

    const mainTimer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(mainTimer);
  }, [isTimerStarted]);

  // Таймер отдыха: работает только во время активной сессии
  useEffect(() => {
    if (restTimeLeft === null || !isTimerStarted) return;

    const restTimer = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(restTimer);
          toast("Отдых завершен! Пора делать следующий подход 🏋️‍♂️", {
            position: "top-center",
          });
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(restTimer);
  }, [restTimeLeft, isTimerStarted]);

  // Живой подсчет калорий на основе MET, веса и прошедшего времени
  const liveBurnedCalories = useMemo(() => {
    if (selectedExercises.length === 0 || secondsElapsed <= 0) return 0;
    const avgMet =
      selectedExercises.reduce((sum, ex) => sum + (ex.met || 4.0), 0) /
      selectedExercises.length;
    const durationInMinutes = secondsElapsed / 60;
    const caloriesPerMinute = avgMet * 3.5 * (userWeight / 200);
    return Math.round(caloriesPerMinute * durationInMinutes);
  }, [selectedExercises, secondsElapsed, userWeight]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleSetDone = (
    exIndex: number,
    setIndex: number,
    currentDone: boolean,
  ) => {
    // Не даем отмечать подходы, пока тренировка физически не началась
    if (!isTimerStarted) {
      toast.error("Сначала запустите тренировку кнопкой «Старт» сверху!");
      return;
    }

    const nextDoneState = !currentDone;
    updateSetValues(exIndex, setIndex, "done", nextDoneState);

    if (nextDoneState) {
      setRestTimeLeft(90); // Запуск 90 секунд отдыха
    }
  };

  const handleFinish = () => {
    const hasActiveSets = selectedExercises.some((ex) =>
      ex.sets.some((s) => s.done),
    );
    if (selectedExercises.length === 0 || !hasActiveSets) {
      toast.error("Отметьте хотя бы один выполненный подход галочкой!");
      return;
    }
    const finalMinutes = Math.round(secondsElapsed / 60) || 1;
    finishActiveWorkout(finalMinutes);
  };
  return (
    <div className="space-y-6 text-left relative pb-12">
      {/* Плавающий виджет отдыха (показывается только во время активной фазы) */}
      {restTimeLeft !== null && isTimerStarted && (
        <div className="fixed bottom-24 right-6 bg-emerald-600 text-white font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce z-50">
          <Timer size={18} className="animate-spin" />
          <span>Отдых: {restTimeLeft} сек</span>
          <button
            onClick={() => setRestTimeLeft(null)}
            className="ml-2 text-emerald-200 text-xs underline"
          >
            Пропустить
          </button>
        </div>
      )}

      {/* Условный рендеринг верхней панели: Подготовка vs Активный режим */}
      {!isTimerStarted ? (
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
            onClick={() => setIsTimerStarted(true)}
            className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-900/20 w-full md:w-auto justify-center shrink-0 border-b-4 border-emerald-700 active:border-b-0 active:mt-1"
          >
            <Play size={16} fill="currentColor" /> Начать тренировку
          </button>
        </div>
      ) : (
        /* Закрепленные живые панели статистики */
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
              {formatTime(secondsElapsed)}
            </div>
          </div>
        </div>
      )}

      {/* Вспомогательный статус-бар, если тренировка уже тикает */}
      {isTimerStarted && (
        <div className="pt-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block animate-pulse">
            • ТРЕНИРОВКА В ПРОЦЕССЕ
          </span>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {customWorkoutName || "Активный комплекс"}
          </h2>
        </div>
      )}

      {/* Список упражнений */}
      <div className="space-y-4">
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
                onClick={() => removeExerciseFromWorkout(exIndex)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center px-2">
                <span>Сет</span>
                <span>Вес (кг)</span>
                <span>Повторы</span>
                <span>Готово</span>
              </div>

              {ex.sets.map((set, setIndex: number) => (
                <div
                  key={setIndex}
                  className={`grid grid-cols-4 gap-2 items-center text-center p-1 rounded-xl transition-colors ${
                    set.done ? "bg-emerald-50/50" : ""
                  }`}
                >
                  <span className="font-black text-slate-400 text-xs">
                    #{setIndex + 1}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
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
                  <input
                    type="number"
                    inputMode="numeric"
                    value={set.reps}
                    onChange={(e) =>
                      updateSetValues(exIndex, setIndex, "reps", e.target.value)
                    }
                    className="bg-slate-50 border p-2 rounded-xl text-center font-bold outline-none focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={() =>
                      handleToggleSetDone(exIndex, setIndex, set.done)
                    }
                    className={`mx-auto p-2 rounded-xl border-2 transition-all ${
                      set.done
                        ? "bg-emerald-500 border-emerald-500 text-white scale-105"
                        : "border-slate-200 text-transparent"
                    }`}
                  >
                    <CheckCircle
                      size={14}
                      className={set.done ? "text-white" : "text-slate-200"}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSetToExercise(exIndex)}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={12} /> Добавить подход
            </button>
          </div>
        ))}
      </div>

      {/* Добавление внепланового упражнения */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 space-y-3">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
          Добавить внеплановое упражнение
        </h4>
        <div className="flex flex-wrap gap-2">
          {EXERCISES_DATABASE.map((exTemplate) => (
            <button
              key={exTemplate.id}
              onClick={() => addExerciseToWorkout(exTemplate)}
              className="p-2.5 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-2xl text-xs font-medium text-slate-700 transition-all flex items-center gap-2"
            >
              <span>{exTemplate.image}</span>
              <span>{exTemplate.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Панель управления действиями */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => {
            if (
              window.confirm(
                "Прервать тренировку? Текущие данные не будут сохранены.",
              )
            ) {
              cancelWorkout();
            }
          }}
          className="w-1/3 h-14 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
        >
          Прервать
        </button>
        <button
          onClick={handleFinish}
          disabled={!isTimerStarted}
          className={`w-2/3 h-14 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg border-b-4 ${
            isTimerStarted
              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 border-emerald-800 active:border-b-0 active:mt-1 cursor-pointer"
              : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none"
          }`}
        >
          Завершить тренировку 🏁
        </button>
      </div>
    </div>
  );
}
