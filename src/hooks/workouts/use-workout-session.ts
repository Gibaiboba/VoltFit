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
import { UserProfile } from "@/types/user";
import { useServerToday } from "@/providers/DateProvider";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";
import { WorkoutTemplate } from "@/types/workout";

export function useWorkoutSession() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();
  const serverToday = useServerToday();
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

  const startWorkoutSession = useActiveWorkoutStore(
    (state) => state.startWorkoutSession,
  );
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

  // Мутация удаления шаблона из БД
  const { mutateAsync: mutateDeleteTemplate, isPending: isDeletingTemplate } =
    useMutation({
      mutationFn: async (templateId: string) => {
        if (!profile?.id) throw new Error("Пользователь не авторизован");

        const { error } = await supabase
          .from("workout_templates")
          .delete()
          .eq("id", templateId);

        if (error) throw error;
      },
      onMutate: async (templateId) => {
        // Отменяем текущие запросы списка шаблонов
        await queryClient.cancelQueries({
          queryKey: ["workout-templates", profile?.id],
        });

        // Сохраняем предыдущее состояние кэша на случай ошибки
        const previousTemplates = queryClient.getQueryData<WorkoutTemplate[]>([
          "workout-templates",
          profile?.id,
        ]);

        // Мгновенно убираем шаблон из интерфейса (Optimistic UI)
        queryClient.setQueryData<WorkoutTemplate[]>(
          ["workout-templates", profile?.id],
          (old) => (old ? old.filter((t) => t.id !== templateId) : []),
        );

        return { previousTemplates };
      },
      onSuccess: () => {
        toast.success("Шаблон тренировки удален");
      },
      onError: (error, _templateId, context) => {
        // Откатываем кэш назад, если произошла ошибка сети
        if (context?.previousTemplates) {
          queryClient.setQueryData(
            ["workout-templates", profile?.id],
            context.previousTemplates,
          );
        }
        console.error("Ошибка при удалении шаблона:", error);
        toast.error("Не удалось удалить шаблон");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: ["workout-templates", profile?.id],
        });
      },
    });

  // --- Вычисляемые свойства ---

  const activeScreen = useMemo<
    "dashboard" | "onboarding" | "custom_workout" | "active_workout"
  >(() => {
    if (!profile) return "dashboard";

    if (!onboardingMetadata.fitness_onboarding_completed) {
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
  ]);

  const updateRestTime = (exIndex: number, newSeconds: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex ? { ...ex, rest_time: Math.max(0, newSeconds) } : ex,
      ),
    );
  };

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
      const userId = profile?.id;
      if (!userId) return;

      const newMetadata = {
        ...onboardingMetadata,
        fitness_onboarding_completed: true,
        fitness_answers: updated,
      };

      queryClient.setQueryData<typeof profile>(
        ["user-profile", userId],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            onboarding_metadata: newMetadata,
          };
        },
      );

      // 2. Отправляем данные на сервер
      updateProfile(
        { onboarding_metadata: newMetadata },
        {
          onSuccess: () => {
            // 3. Сбрасываем индекс ТОЛЬКО после того, как экран УЖЕ переключился на дашборд
            setIsResetting(false);
            setCurrentQuestionIndex(0);
            toast.success("План тренировок успешно сформирован!");
          },
          onError: () => {
            toast.error("Не удалось сохранить ответы опроса");
            // Если сервер лег — откатываем кэш назад, чтобы юзер мог попробовать еще раз
            queryClient.invalidateQueries({
              queryKey: ["user-profile", userId],
            });
          },
        },
      );
    }
  };

  const resetFitnessOptions = () => {
    const userId = profile?.id;
    if (!userId) {
      toast.error("Пользователь не авторизован");
      return;
    }
    setIsResetting(true);
    setCurrentQuestionIndex(0);
    setLocalAnswers({});

    const newMetadata = {
      ...onboardingMetadata,
      fitness_onboarding_completed: false,
      fitness_answers: {},
    };

    queryClient.setQueryData<UserProfile | null>(
      ["user-profile", userId],
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          onboarding_metadata: newMetadata,
        };
      },
    );
    updateProfile(
      { onboarding_metadata: newMetadata },
      {
        onSuccess: () => {
          toast.success("Параметры сброшены. Пройдите опрос заново.");
        },
        onError: (err) => {
          console.error("Ошибка при синхронизации с БД:", err);
          toast.error("Не удалось сохранить изменения на сервере");
          queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
        },
      },
    );
  };

  // --- Методы конструктора тренировок ---

  const addExerciseToWorkout = (exTemplate: ExerciseTemplate) => {
    setSelectedExercises((prev) => [
      ...prev,
      {
        id: exTemplate.id,
        title: exTemplate.title,
        met: exTemplate.met,
        video_url: exTemplate.video_url,
        sets: [{ reps: "10", weight: "0", done: false }],
        rest_time: 90,
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

      // 1. Вычисляем сожжённые калории тренировки
      const avgMet =
        selectedExercises.length > 0
          ? selectedExercises.reduce((sum, ex) => sum + ex.met, 0) /
            selectedExercises.length
          : 5; // Безопасный дефолт MET

      const finalCalories = Math.round(
        avgMet * 3.5 * (userWeight / 200) * finalDuration,
      );

      // А. Сохраняем детальный лог в таблицу workout_logs
      const savedWorkoutLog = await mutateSaveWorkoutLog({
        duration: finalDuration,
        calories: finalCalories,
      });
      // Б. ИСПРАВЛЕННЫЙ ПОИСК КЭША: достаем данные дневника/трекера
      const allRangeQueries = queryClient.getQueriesData<DailyLog[]>({
        queryKey: ["student-logs-range", profile.id],
      });

      // Извлекаем массив из первой найденной структуры кэша
      const firstCacheTuple = allRangeQueries[0];
      const cachedLogs = firstCacheTuple ? firstCacheTuple[1] : [];
      const todayLogFromCache = cachedLogs?.find(
        (l) => l.log_date === serverToday,
      );

      // В. Формируем новый объект активности ДЛЯ МАССИВА JSONB (без верхнеуровневых полей)
      const newGymActivity = {
        id: crypto.randomUUID(),
        workout_log_id: savedWorkoutLog.id,
        activity_id: "strength_normal",
        burned_calories: finalCalories,
        duration: finalDuration,
        name: customWorkoutName,
      };

      const currentActivities = todayLogFromCache?.activities || [];
      const updatedActivities = [...currentActivities, newGymActivity];

      // Г. Считаем общую сумму сожженных калорий за день
      const totalDayBurnedCalories = updatedActivities.reduce(
        (sum, act) => sum + (Number(act.burned_calories) || 0),
        0,
      );

      // Д. Запускаем безопасную мутацию дашборда (без отправки лишней колонки activity_name)
      await saveMutation.mutateAsync({
        log_date: serverToday,
        activities: updatedActivities,
        burned_calories: totalDayBurnedCalories,
        steps: todayLogFromCache?.steps || 0,
        weight: todayLogFromCache?.weight || undefined,
        water: todayLogFromCache?.water || 0,
        sleep_hours: todayLogFromCache?.sleep_hours || 0,
      });

      // Полный сброс экрана сессии
      setIsActiveSessionActive(false);
      setSelectedExercises([]);
      setWorkoutDuration(0);
      setCustomWorkoutName("Моя тренировка");

      toast.success(
        "Тренировка сохранена! КБЖУ в дневнике успешно обновлен 🚀",
      );
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

  const launchGlobalWorkout = (active: boolean) => {
    if (active) {
      // 1. Вызываем обновление глобального стора напрямую
      startWorkoutSession(customWorkoutName, selectedExercises);

      // 2. Очищаем локальные черновики конструктора
      setSelectedExercises([]);
      setCustomWorkoutName("Моя тренировка");
    }
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
    isResetting,
    updateRestTime,
    finishActiveWorkout,
    setIsCustomWorkoutActive: setIsBuilderActive,
    setIsActiveSessionActive: launchGlobalWorkout,
    deleteWorkoutTemplate: mutateDeleteTemplate,
    isDeletingTemplate,
  };
}
