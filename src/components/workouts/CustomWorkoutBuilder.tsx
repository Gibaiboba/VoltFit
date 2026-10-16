"use client";

import { Trash2, PlusCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { CustomWorkoutBuilderProps } from "@/types/workout";
import { EXERCISES_DATABASE } from "@/constants/workout/exerciseData";

export default function CustomWorkoutBuilder({
  customWorkoutName,
  setCustomWorkoutName,
  selectedExercises,
  workoutDuration,
  totalVolumeLoad,
  totalBurnedCalories,
  addExerciseToWorkout,
  addSetToExercise,
  updateSetValues,
  removeExerciseFromWorkout,
  cancelWorkout,
  setIsCustomWorkoutActive,
  handleDurationChange,
}: CustomWorkoutBuilderProps) {
  const handleFinishWorkout = () => {
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
  };

  return (
    <div className="space-y-6 text-left">
      {/* Панель управления и калькуляторы */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
            Общий тоннаж (Объем)
          </span>
          <div className="text-4xl font-black italic mt-1 text-blue-400">
            {totalVolumeLoad}{" "}
            <span className="text-xs not-italic text-slate-400">кг</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col justify-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
            Расход энергии (MET)
          </span>
          <div className="text-4xl font-black italic mt-1 text-emerald-400">
            {totalBurnedCalories}{" "}
            <span className="text-xs not-italic text-slate-400">ккал</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col justify-center">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
            Длительность (минут)
          </label>
          <input
            type="number"
            value={workoutDuration || ""}
            onChange={handleDurationChange}
            className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 outline-none text-xl font-black focus:border-blue-500"
            placeholder="0 мин"
          />
        </div>
      </div>

      {/* Список упражнений тренировки */}
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
                      updateSetValues(exIndex, setIndex, "done", !set.done)
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

      {/* Панель добавления из библиотеки */}
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

      {/* Финальные кнопки */}
      <div className="flex gap-3">
        <button
          onClick={cancelWorkout}
          className="w-1/3 h-14 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
        >
          Отмена
        </button>
        <button
          onClick={handleFinishWorkout}
          className="w-2/3 h-14 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 border-b-4 border-blue-800 active:border-b-0 active:mt-1"
        >
          Завершить тренировку 🏁
        </button>
      </div>
    </div>
  );
}
