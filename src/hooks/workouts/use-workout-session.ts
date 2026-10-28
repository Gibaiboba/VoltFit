"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "sonner";
import {
  OnboardingMetadata,
  WorkoutExercise,
  ExerciseTemplate,
} from "@/types/workout";
import { FITNESS_QUESTIONS } from "@/constants/workout/fitnessQuestion";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useDashboardMutations } from "@/hooks/use-student-dashboard/use-mutations";
import { DailyLog } from "@/types/shared";

export function useWorkoutSession() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();

  // Подключаем мутацию дашборда прямо в сессию тренировки!
  const { saveMutation } = useDashboardMutations(profile?.id || "", () => {});

  const { mutate: updateProfile } = useUpdateProfile();

  // Локальные состояния экранов и конструктора
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [localFitnessAnswers, setLocalAnswers] = useState<
    Record<string, string>
  >({});
  const [isBuilderActive, setIsBuilderActive] = useState<boolean>(false);
  const [isActiveSessionActive, setIsActiveSessionActive] =
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

  // --- Запросы и мутации---

  // Запрос списка шаблонов пользователя из Supabase
  const { data: savedTemplates = [] } = useQuery({
    queryKey: ["workout-templates", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Мутация сохранения шаблона в БД
  const { mutateAsync: mutateSaveTemplate } = useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error("Пользователь не авторизован");

      const { data, error } = await supabase
        .from("workout_templates")
        .insert({
          user_id: profile.id,
          name: customWorkoutName,
          exercises: selectedExercises,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(`Шаблон "${customWorkoutName}" успешно сохранен!`);
      queryClient.invalidateQueries({
        queryKey: ["workout-templates", profile?.id],
      });

      setIsBuilderActive(false);
      setSelectedExercises([]);
      setCustomWorkoutName("Моя тренировка");
    },
    onError: (error) => {
      console.error("Ошибка при сохранении шаблона:", error);
      toast.error("Не удалось сохранить шаблон в базу данных");
    },
  });

  // --- Вычисляемые свойства ---

  const activeScreen = useMemo<
    "dashboard" | "onboarding" | "custom_workout" | "active_workout"
  >(() => {
    if (!profile) return "dashboard";
    if (!onboardingMetadata.fitness_onboarding_completed && !isResetting) {
      return "onboarding";
    }
    if (isActiveSessionActive) return "active_workout";
    if (isBuilderActive) return "custom_workout";
    return "dashboard";
  }, [
    profile,
    onboardingMetadata.fitness_onboarding_completed,
    isBuilderActive,
    isActiveSessionActive,
    isResetting,
  ]);

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

  const totalBurnedCalories = useMemo<number>(() => {
    if (selectedExercises.length === 0 || workoutDuration <= 0) return 0;
    const avgMet =
      selectedExercises.reduce((sum, ex) => sum + ex.met, 0) /
      selectedExercises.length;
    const caloriesPerMinute = avgMet * 3.5 * (userWeight / 200);
    return Math.round(caloriesPerMinute * workoutDuration);
  }, [selectedExercises, workoutDuration, userWeight]);

  // --- Логика фитнес-анбординга ---

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

      updateProfile({ onboarding_metadata: newMetadata });
      setIsResetting(false);
      setCurrentQuestionIndex(0);
    }
  };

  const resetFitnessOptions = () => {
    setIsResetting(true);
    const newMetadata = {
      ...onboardingMetadata,
      fitness_onboarding_completed: false,
      fitness_answers: {},
    };

    updateProfile({ onboarding_metadata: newMetadata });
  };

  // --- Методы конструктора тренировок ---

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

  const removeExerciseFromWorkout = (exIndex: number) => {
    setSelectedExercises((prev) => prev.filter((_, idx) => idx !== exIndex));
  };

  // --- Экшены завершения сессий ---

  const saveWorkoutTemplate = async () => {
    await mutateSaveTemplate();
  };

  const { mutateAsync: mutateSaveWorkoutLog } = useMutation({
    mutationFn: async (payload: { duration: number; calories: number }) => {
      if (!profile?.id) throw new Error("Пользователь не авторизован");

      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          user_id: profile.id,
          name: customWorkoutName,
          exercises: selectedExercises, //  массив WorkoutExercise[]
          duration: payload.duration,
          burned_calories: payload.calories,
          total_volume: totalVolumeLoad,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error("Ошибка при сохранении детальной тренировки:", error);
    },
  });

  // 2. Главный обновленный экшен завершения живой сессии
  const finishActiveWorkout = async (finalDuration: number) => {
    try {
      if (!profile?.id) return;

      // Вычисляем сожжённые калории на основе финального времени секундомера
      const avgMet =
        selectedExercises.reduce((sum, ex) => sum + ex.met, 0) /
        selectedExercises.length;
      const finalCalories = Math.round(
        avgMet * 3.5 * (userWeight / 200) * finalDuration,
      );

      // А. Сначала сохраняем историю в таблицу workout_logs
      await mutateSaveWorkoutLog({
        duration: finalDuration,
        calories: finalCalories,
      });

      //  Достаем из кэша TanStack Query текущий лог за СЕГОДНЯ, чтобы не затереть шаги/воду/бег
      const todayStr = new Date().toISOString().split("T")[0];

      // Ищем кэш диапазона или конкретного лога, который использует дашборд
      const cachedLogs =
        queryClient.getQueryData<DailyLog[]>([
          "student-logs-range",
          profile.id,
        ]) || [];

      const todayLogFromCache = cachedLogs.find((l) => l.log_date === todayStr);

      //  Формируем новый объект активности по ACTIVITIES_MAP
      const newGymActivity = {
        id: crypto.randomUUID(),
        activity_id: "strength_normal",
        burned_calories: finalCalories,
        duration: finalDuration,
        // Имя, которое автоматически распарсится мутацией дашборда
        name: `Силовая: ${customWorkoutName}`,
      };

      // Соединяем старые активности за сегодня с новой тренировкой
      const currentActivities = todayLogFromCache?.activities || [];
      const updatedActivities = [...currentActivities, newGymActivity];

      // Запускаем оптимистичную мутацию дашборда!
      // Она обновит кружки и графики на StudentClient в памяти
      saveMutation.mutate({
        log_date: todayStr,
        activities: updatedActivities,
        // Передаем старые значения, чтобы оптимистичный апдейт их сохранил
        steps: todayLogFromCache?.steps || 0,
        weight: todayLogFromCache?.weight || undefined,
        water: todayLogFromCache?.water || 0,
        sleep_hours: todayLogFromCache?.sleep_hours || 0,
      });

      // Полный сброс активного экрана в дефолт
      setIsActiveSessionActive(false);
      setSelectedExercises([]);
      setWorkoutDuration(0);
      setCustomWorkoutName("Моя тренировка");
    } catch (error) {
      console.error("Ошибка при завершении тренировки:", error);
      toast.error("Не удалось завершить тренировку. Проверьте сеть.");
    }
  };

  const cancelWorkout = () => {
    setIsBuilderActive(false);
    setIsActiveSessionActive(false);
    setSelectedExercises([]);
    setWorkoutDuration(0);
    setCustomWorkoutName("Моя тренировка");
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setWorkoutDuration(Math.max(0, parseInt(e.target.value) || 0));
  };

  return {
    userWeight,
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
    savedTemplates,
    handleSelectOnboardingOption,
    addExerciseToWorkout,
    addSetToExercise,
    updateSetValues,
    removeExerciseFromWorkout,
    resetFitnessOptions,
    cancelWorkout,
    handleDurationChange,
    saveWorkoutTemplate,
    finishActiveWorkout,
    setIsCustomWorkoutActive: setIsBuilderActive,
    setIsActiveSessionActive,
  };
}
