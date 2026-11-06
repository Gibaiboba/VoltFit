"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkoutSession } from "@/hooks/workouts/use-workout-session";
import WorkoutOnboarding from "@/components/workouts/WorkoutOnboarding";
import WorkoutDashboard from "@/components/workouts/WorkoutDashboard";
import CustomWorkoutBuilder from "@/components/workouts/CustomWorkoutBuilder";
import ActiveWorkoutSession from "@/components/workouts/ActiveWorkoutSession/ActiveWorkoutSession";

export default function WorkoutsPage() {
  const session = useWorkoutSession();
  const isWorkoutActive = session.activeScreen === "active_workout";

  // Перехват системной кнопки "Назад" в браузере / на смартфоне
  useEffect(() => {
    if (!isWorkoutActive) return;

    // Пушим фейковое состояние, блокируя мгновенный уход со страницы
    window.history.pushState({ overlay: "workout-active" }, "");

    const handlePopState = () => {
      const confirmClose = window.confirm(
        "Вы действительно хотите прервать тренировку? Текущий прогресс будет потерян.",
      );

      if (confirmClose) {
        session.cancelWorkout();
      } else {
        // Возвращаем фейковую точку в историю, если пользователь передумал выходить
        window.history.pushState({ overlay: "workout-active" }, "");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isWorkoutActive, session]);

  if (session.isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 min-h-[calc(100vh-64px)] mt-16 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        Синхронизация спортивного комплекса...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-[calc(100vh-64px)] mt-16 text-slate-900 bg-slate-50 rounded-[40px] relative">
      {/* Стандартные экраны внутри контейнера */}
      <AnimatePresence mode="wait">
        {session.activeScreen === "onboarding" && (
          <WorkoutOnboarding
            currentQuestionIndex={session.currentQuestionIndex}
            handleSelectOnboardingOption={session.handleSelectOnboardingOption}
          />
        )}

        {session.activeScreen === "dashboard" && (
          <WorkoutDashboard
            onboardingMetadata={session.onboardingMetadata}
            userGlobalGoal={session.userGlobalGoal}
            setIsActiveSessionActive={session.setIsActiveSessionActive}
            setIsCustomWorkoutActive={session.setIsCustomWorkoutActive}
            setSelectedExercises={session.setSelectedExercises}
            setCustomWorkoutName={session.setCustomWorkoutName}
            resetFitnessOptions={session.resetFitnessOptions}
            savedTemplates={session.savedTemplates}
          />
        )}

        {session.activeScreen === "custom_workout" && (
          <CustomWorkoutBuilder
            customWorkoutName={session.customWorkoutName}
            setCustomWorkoutName={session.setCustomWorkoutName}
            selectedExercises={session.selectedExercises}
            removeExerciseFromWorkout={session.removeExerciseFromWorkout}
            addExerciseToWorkout={session.addExerciseToWorkout}
            addSetToExercise={session.addSetToExercise}
            updateSetValues={session.updateSetValues}
            cancelWorkout={session.cancelWorkout}
            saveWorkoutTemplate={session.saveWorkoutTemplate}
          />
        )}
      </AnimatePresence>

      {/* ПОЛНОЭКРАННЫЙ ОВЕРЛЕЙ ЖИВОЙ ТРЕНИРОВКИ */}
      <AnimatePresence>
        {isWorkoutActive && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto mt-16 rounded-t-[40px] shadow-2xl border-t border-slate-200/80"
          >
            <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8">
              <ActiveWorkoutSession
                customWorkoutName={session.customWorkoutName}
                selectedExercises={session.selectedExercises}
                totalVolumeLoad={session.totalVolumeLoad}
                totalBurnedCalories={session.totalBurnedCalories || 0}
                userWeight={session.userWeight || 70}
                updateSetValues={session.updateSetValues}
                addSetToExercise={session.addSetToExercise}
                removeExerciseFromWorkout={session.removeExerciseFromWorkout}
                addExerciseToWorkout={session.addExerciseToWorkout}
                finishActiveWorkout={session.finishActiveWorkout}
                cancelWorkout={session.cancelWorkout}
                updateRestTime={session.updateRestTime}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
