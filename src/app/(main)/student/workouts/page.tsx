"use client";

import { AnimatePresence } from "framer-motion";
import { useWorkoutSession } from "@/hooks/workouts/use-workout-session";
import WorkoutOnboarding from "@/components/workouts/WorkoutOnboarding";
import WorkoutDashboard from "@/components/workouts/WorkoutDashboard";
import CustomWorkoutBuilder from "@/components/workouts/CustomWorkoutBuilder";

export default function WorkoutsPage() {
  const session = useWorkoutSession();

  if (session.isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 min-h-[calc(100vh-64px)] mt-16 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        Синхронизация спортивного комплекса...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-[calc(100vh-64px)] mt-16 text-slate-900 bg-slate-50 rounded-[40px]">
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
    </div>
  );
}
