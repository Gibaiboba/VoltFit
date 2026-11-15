"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "sonner";
import {
  OnboardingMetadata,
  WorkoutExercise,
  ExerciseTemplate,
  WorkoutTemplate,
} from "@/types/workout";
import { FITNESS_QUESTIONS } from "@/constants/workout/fitnessQuestion";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { UserProfile } from "@/types/user";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";

export function useWorkoutSession() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();
  const { mutate: updateProfile } = useUpdateProfile();

  // Локальные состояния онбординга и конструктора
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [localFitnessAnswers, setLocalAnswers] = useState<
    Record<string, string>
  >({});
  const [isBuilderActive, setIsBuilderActive] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [customWorkoutName, setCustomWorkoutName] =
    useState<string>("Моя тренировка");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>(
    [],
  );

  const startWorkoutSession = useActiveWorkoutStore(
    (state) => state.startWorkoutSession,
  );

  // Безопасные дефолтные значения из профиля
  const onboardingMetadata = useMemo<Partial<OnboardingMetadata>>(() => {
    return profile?.onboarding_metadata || {};
  }, [profile]);

  const userGlobalGoal = profile?.goal || "maintain";
  const userWeight = profile?.weight || 70;

  // --- Запросы и мутации шаблонов ---

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
        await queryClient.cancelQueries({
          queryKey: ["workout-templates", profile?.id],
        });

        const previousTemplates = queryClient.getQueryData<WorkoutTemplate[]>([
          "workout-templates",
          profile?.id,
        ]);

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
    "dashboard" | "onboarding" | "custom_workout"
  >(() => {
    if (!profile) return "dashboard";
    if (!onboardingMetadata.fitness_onboarding_completed) {
      return "onboarding";
    }
    if (isBuilderActive) return "custom_workout";
    return "dashboard";
  }, [
    profile,
    onboardingMetadata.fitness_onboarding_completed,
    isBuilderActive,
  ]);
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

      updateProfile(
        { onboarding_metadata: newMetadata },
        {
          onSuccess: () => {
            setIsResetting(false);
            setCurrentQuestionIndex(0);
            toast.success("План тренировок успешно сформирован!");
          },
          onError: () => {
            toast.error("Не удалось сохранить ответы опроса");
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

  const updateRestTime = (exIndex: number, newSeconds: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex, i) =>
        i === exIndex ? { ...ex, rest_time: Math.max(0, newSeconds) } : ex,
      ),
    );
  };

  const cancelWorkout = () => {
    setIsBuilderActive(false);
    setSelectedExercises([]);
    setCustomWorkoutName("Моя тренировка");
  };

  const saveWorkoutTemplate = async () => {
    await mutateSaveTemplate();
  };

  const launchGlobalWorkout = (active: boolean) => {
    if (active) {
      startWorkoutSession(customWorkoutName, selectedExercises);
      setIsBuilderActive(false);
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
    savedTemplates,
    handleSelectOnboardingOption,
    addExerciseToWorkout,
    addSetToExercise,
    updateSetValues,
    removeExerciseFromWorkout,
    resetFitnessOptions,
    cancelWorkout,
    saveWorkoutTemplate,
    isResetting,
    updateRestTime,
    setIsCustomWorkoutActive: setIsBuilderActive,
    setIsActiveSessionActive: launchGlobalWorkout,
    deleteWorkoutTemplate: mutateDeleteTemplate,
    isDeletingTemplate,
  };
}
