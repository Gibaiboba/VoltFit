"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "sonner";
import {
  OnboardingMetadata,
  WorkoutExercise,
  ExerciseTemplate,
} from "@/types/workout";
import { FITNESS_QUESTIONS } from "@/constants/workout/fitnessQuestion";

export function useWorkoutSession() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();

  // Локальные состояния
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [localFitnessAnswers, setLocalAnswers] = useState<
    Record<string, string>
  >({});
  const [isCustomWorkoutActive, setIsCustomWorkoutActive] =
    useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [customWorkoutName, setCustomWorkoutName] =
    useState<string>("Моя тренировка");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>(
    [],
  );
  const [workoutDuration, setWorkoutDuration] = useState<number>(0);

  // Безопасные дефолтные значения из профиля
  const onboardingMetadata = useMemo<Partial<OnboardingMetadata>>(() => {
    return profile?.onboarding_metadata || {};
  }, [profile]);

  const userGlobalGoal = profile?.goal || "maintain";
  const userWeight = profile?.weight || 70;

  // Диспетчер активного экрана
  const activeScreen = useMemo<
    "dashboard" | "onboarding" | "custom_workout"
  >(() => {
    if (!profile) return "dashboard";
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

  // Логика пошагового анбординга
  const handleSelectOnboardingOption = (questionId: string, value: string) => {
    const updated = { ...localFitnessAnswers, [questionId]: value };
    setLocalAnswers(updated);

    if (currentQuestionIndex < FITNESS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
    } else {
      const newMetadata: OnboardingMetadata = {
        ...onboardingMetadata,
        fitness_onboarding_completed: true,
        fitness_answers: updated,
      };
      updateFitnessMetadata(newMetadata);
    }
  };

  // Реактивный подсчет суммарного тоннажа
  const totalVolumeLoad = useMemo<number>(() => {
    return selectedExercises.reduce((totalEx, ex) => {
      const exVolume = ex.sets.reduce((totalSet, set) => {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps) || 0;
        return totalSet + (set.done ? w * r : 0);
      }, 0);
      return totalEx + exVolume;
    }, 0);
  }, [selectedExercises]);

  // Реактивный подсчет калорий по коэффициенту MET
  const totalBurnedCalories = useMemo<number>(() => {
    if (selectedExercises.length === 0 || workoutDuration <= 0) return 0;
    const avgMet =
      selectedExercises.reduce((sum, ex) => sum + ex.met, 0) /
      selectedExercises.length;
    const caloriesPerMinute = avgMet * 3.5 * (userWeight / 200);
    return Math.round(caloriesPerMinute * workoutDuration);
  }, [selectedExercises, workoutDuration, userWeight]);

  // Конструктор: Добавление нового упражнения из библиотеки
  const addExerciseToWorkout = (exTemplate: ExerciseTemplate) => {
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

  // Конструктор: Добавление сета в существующее упражнение
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

  // Конструктор: Обновление параметров инпутов внутри сета
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

  // Конструктор: Удаление упражнения из списка
  const removeExerciseFromWorkout = (exIndex: number) => {
    setSelectedExercises((prev) => prev.filter((_, idx) => idx !== exIndex));
  };

  // Сброс параметров и повторный опрос
  const resetFitnessOptions = () => {
    setIsResetting(true);
    const newMetadata = {
      ...onboardingMetadata,
      fitness_onboarding_completed: false,
      fitness_answers: {},
    };
    updateFitnessMetadata(newMetadata as OnboardingMetadata);
  };

  // Кнопка отмены активного конструктора сессии
  const cancelWorkout = () => {
    setIsCustomWorkoutActive(false);
    setSelectedExercises([]);
    setWorkoutDuration(0);
  };

  // Изменение длительности тренировки
  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWorkoutDuration(Math.max(0, parseInt(e.target.value) || 0));
  };

  return {
    isLoading,
    activeScreen,
    currentQuestionIndex,
    onboardingMetadata,
    userGlobalGoal,
    customWorkoutName,
    setCustomWorkoutName,
    selectedExercises,
    setSelectedExercises,
    workoutDuration,
    totalVolumeLoad,
    totalBurnedCalories,
    handleSelectOnboardingOption,
    addExerciseToWorkout,
    addSetToExercise,
    updateSetValues,
    removeExerciseFromWorkout,
    resetFitnessOptions,
    cancelWorkout,
    handleDurationChange,
    setIsCustomWorkoutActive,
  };
}
