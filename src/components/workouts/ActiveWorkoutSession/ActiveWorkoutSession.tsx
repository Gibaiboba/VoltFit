"use client";

import { PlusCircle, X } from "lucide-react";
import { toast } from "sonner";
import ExercisesCatalog from "@/components/workouts/ExercisesCatalog";
import { useActiveWorkout } from "@/hooks/workouts/use-active-workout";
import { RestTimerModal } from "@/components/workouts/ActiveWorkoutSession/RestTimerModal";
import { WorkoutHeader } from "@/components/workouts/ActiveWorkoutSession/WorkoutHeader";
import { ExerciseItem } from "@/components/workouts/ActiveWorkoutSession/ExerciseItem";

interface ActiveWorkoutSessionProps {
  userWeight: number;
}

export default function ActiveWorkoutSession({
  userWeight,
}: ActiveWorkoutSessionProps) {
  const {
    customWorkoutName,
    selectedExercises,
    isTimerStarted,
    handleStartTimer,
    minimizeWorkout,
    cancelWorkout,
    restTimeLeft,
    addRestSeconds,
    skipRest,
    isCatalogOpen,
    setIsCatalogOpen,
    totalVolumeLoad,
    liveBurnedCalories,
    formattedTime,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    updateRestTime,
    handleToggleSetDone,
    handleFinish,
    isSubmitting,
  } = useActiveWorkout({
    userWeight,
  });

  return (
    <div className="space-y-6 text-left relative pb-12">
      {/* ПЛАВАЮЩИЙ ТАЙМЕР ОТДЫХА */}
      {restTimeLeft !== null && isTimerStarted && (
        <RestTimerModal
          restTimeLeft={restTimeLeft}
          onAddSeconds={() => addRestSeconds(30)}
          onSkip={skipRest}
        />
      )}

      {/* ШАПКА ТРЕНИРОВКИ */}
      <WorkoutHeader
        isTimerStarted={isTimerStarted}
        customWorkoutName={customWorkoutName}
        totalVolumeLoad={totalVolumeLoad}
        liveBurnedCalories={liveBurnedCalories}
        formattedTime={formattedTime}
        onStartTimer={handleStartTimer}
        onMinimize={minimizeWorkout}
        onCancel={cancelWorkout}
      />

      {/* Вспомогательный статус-бар активного режима */}
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

      {/* СПИСОК УПРАЖНЕНИЙ */}
      <div className="space-y-4">
        {selectedExercises.map((ex, exIndex) => (
          <ExerciseItem
            key={exIndex}
            ex={ex}
            exIndex={exIndex}
            onRemoveExercise={removeExercise}
            onUpdateRestTime={updateRestTime}
            onUpdateSetValues={updateSet}
            onToggleSetDone={handleToggleSetDone}
            onAddSet={addSet}
          />
        ))}
      </div>

      {/* КНОПКА ВЫЗОВА КАТАЛОГА УПРАЖНЕНИЙ */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsCatalogOpen(true)}
          className="w-full py-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-750 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <PlusCircle size={16} /> Добавить внеплановое упражнение
        </button>
      </div>

      {/* ВСПЛЫВАЮЩИЙ КАТАЛОГ */}
      {isCatalogOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300 text-left">
            <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                  Каталог упражнений
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Выберите движения для добавления в текущую сессию
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogOpen(false)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 class-scroll-clean">
              <ExercisesCatalog
                onSelectExercise={(ex) => {
                  addExercise(ex);
                  setIsCatalogOpen(false);
                  toast.success(`Упражнение "${ex.title}" добавлено!`);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* НИЖНЯЯ ПАНЕЛЬ ДЕЙСТВИЙ */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
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
          type="button"
          onClick={handleFinish}
          disabled={!isTimerStarted || isSubmitting}
          className={`w-2/3 h-14 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg border-b-4 ${
            isTimerStarted && !isSubmitting
              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 border-emerald-800 active:border-b-0 active:mt-1 cursor-pointer"
              : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none"
          }`}
        >
          {isSubmitting ? "Сохраняем тренировку..." : "Завершить тренировку 🏁"}
        </button>
      </div>
    </div>
  );
}
