"use client";

import { useState, useEffect } from "react";
import { Trash2, PlusCircle, CheckCircle, Timer } from "lucide-react";
import { toast } from "sonner";
import { EXERCISES_DATABASE } from "@/constants/workout/exerciseData";
import { ActiveWorkoutSessionProps } from "@/types/workout";

export default function ActiveWorkoutSession({
  customWorkoutName,
  selectedExercises,
  totalVolumeLoad,
  totalBurnedCalories,
  updateSetValues,
  addSetToExercise,
  removeExerciseFromWorkout,
  addExerciseToWorkout,
  finishActiveWorkout,
  cancelWorkout,
}: ActiveWorkoutSessionProps) {
  // Живые стейты для таймеров
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);

  // Секундомер тренировки (запускается автоматически при монтировании экрана)
  useEffect(() => {
    const mainTimer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(mainTimer);
  }, []);

  // Таймер отдыха между подходами (исправленная версия)
  useEffect(() => {
    // Если отдых не запущен, ничего не делаем
    if (restTimeLeft === null) return;

    // Создаем интервал, который тикает каждую секунду
    const restTimer = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev === null) return null;

        // Если время вышло: выключаем таймер (возвращаем null) и показываем уведомление
        if (prev <= 1) {
          clearInterval(restTimer);
          toast("Отдых завершен! Пора делать следующий подход 🏋️‍♂️", {
            position: "top-center",
          });
          return null;
        }

        // Иначе просто уменьшаем на 1 секунду
        return prev - 1;
      });
    }, 1000);

    // Очищаем интервал при размонтировании или изменении restTimeLeft
    return () => clearInterval(restTimer);
  }, [restTimeLeft]);

  // Хелпер форматирования времени (секунды -> 00:00)
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Перехват клика на чекбокс "Готово" для запуска таймера отдыха
  const handleToggleSetDone = (
    exIndex: number,
    setIndex: number,
    currentDone: boolean,
  ) => {
    const nextDoneState = !currentDone;
    updateSetValues(exIndex, setIndex, "done", nextDoneState);

    // Если пользователь отметил подход как выполненный — запускаем 90 сек отдыха
    if (nextDoneState) {
      setRestTimeLeft(90);
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
    <div className="space-y-6 text-left relative">
      {/* Плавающий виджет таймера отдыха */}
      {restTimeLeft !== null && (
        <div className="fixed bottom-24 right-6 bg-emerald-600 text-white font-black px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce z-50">
          <Timer size={18} className="animate-spin" />
          <span>Отдых: {restTimeLeft} сек</span>
          <button
            onClick={() => setRestTimeLeft(null)}
            className="ml-2 text-emerald-200 text-xs"
          >
            Пропустить
          </button>
        </div>
      )}

      {/* Верхние информационные панели */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
            Текущий объём
          </span>
          <div className="text-4xl font-black italic mt-1 text-blue-400">
            {totalVolumeLoad}{" "}
            <span className="text-xs not-italic text-slate-400">кг</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
            Энергорасход
          </span>
          <div className="text-4xl font-black italic mt-1 text-emerald-400">
            {totalBurnedCalories}{" "}
            <span className="text-xs not-italic text-slate-400">ккал</span>
          </div>
        </div>

        {/* АВТОМАТИЧЕСКИЙ ЖИВОЙ СЕКУНДОМЕР */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex flex-col justify-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">
            Время тренировки
          </span>
          <div className="text-4xl font-black italic mt-1 text-blue-700 tracking-wider">
            {formatTime(secondsElapsed)}
          </div>
        </div>
      </div>

      {/* Заголовок активной сессии */}
      <div className="border-b pb-2 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block animate-pulse">
            • ТРЕНИРОВКА В ПРОЦЕССЕ
          </span>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            {customWorkoutName || "Активный комплекс"}
          </h2>
        </div>
      </div>
      {/* Список упражнений на тренировке */}
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

      {/* Опционально: Оставляем библиотеку снизу, чтобы добавить упражнение на ходу */}
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

      {/* Панель управления сессией */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={cancelWorkout}
          className="w-1/3 h-14 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
        >
          Прервать
        </button>
        <button
          onClick={handleFinish}
          className="w-2/3 h-14 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 border-b-4 border-emerald-800 active:border-b-0 active:mt-1"
        >
          Завершить тренировку 🏁
        </button>
      </div>
    </div>
  );
}
