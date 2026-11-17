"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "sonner";
import {
  FitnessProfile,
  FitnessAnswers,
  WorkoutExercise,
  ExerciseTemplate,
  AssignedProgram,
  WorkoutTemplate,
} from "@/types/workout";

import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { UserProfile } from "@/types/user";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";
import { generatePresetWorkouts } from "@/lib/workout/generate-preset-workouts";

export function useWorkoutSession() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();
  const { mutate: updateProfile } = useUpdateProfile();
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

  // Читаем изолированный спортивный профиль из новой колонки fitness_profile
  const fitnessProfile = useMemo<FitnessProfile>(() => {
    return (
      profile?.fitness_profile || {
        completed: false,
        answers: {},
      }
    );
  }, [profile]);

  // Уровень энергии при необходимости берем из основного онбординга
  const energyLevel = profile?.onboarding_metadata?.energy_level;

  const userGlobalGoal = profile?.goal || "maintain";
  const userWeight = profile?.weight || 70;

  // Внутри useWorkoutSession (импортируй FitnessAnswers из "@/types/workout"):
  const completeFitnessOnboarding = (answers: FitnessAnswers) => {
    const userId = profile?.id;
    if (!userId) return;

    const newFitnessProfile: FitnessProfile = {
      completed: true,
      answers,
      updated_at: new Date().toISOString(),
    };

    queryClient.setQueryData<typeof profile>(
      ["user-profile", userId],
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          fitness_profile: newFitnessProfile,
        };
      },
    );

    updateProfile(
      { fitness_profile: newFitnessProfile },
      {
        onSuccess: () => {
          setIsResetting(false);
          toast.success("Спортивный профиль и программа сформированы! 🚀");
        },
        onError: () => {
          toast.error("Не удалось сохранить ответы анкеты");
          queryClient.invalidateQueries({
            queryKey: ["user-profile", userId],
          });
        },
      },
    );
  };

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
    if (!fitnessProfile.completed) return "onboarding";
    if (isBuilderActive) return "custom_workout";
    return "dashboard";
  }, [profile, fitnessProfile.completed, isBuilderActive]);

  const resetFitnessOptions = () => {
    const userId = profile?.id;
    if (!userId) {
      toast.error("Пользователь не авторизован");
      return;
    }
    setIsResetting(true);

    const emptyFitnessProfile: FitnessProfile = {
      completed: false,
      answers: {},
    };

    queryClient.setQueryData<UserProfile | null>(
      ["user-profile", userId],
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          fitness_profile: emptyFitnessProfile,
        };
      },
    );

    updateProfile(
      { fitness_profile: emptyFitnessProfile },
      {
        onSuccess: () => {
          toast.success("Параметры сброшены. Пройдите анкету заново.");
        },
        onError: (err) => {
          console.error("Ошибка при синхронизации с БД:", err);
          toast.error("Не удалось сохранить изменения на сервере");
          queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
        },
      },
    );
  };

  // Запрос назначенной тренером программы из assigned_programs
  const { data: assignedProgram = null } = useQuery<AssignedProgram | null>({
    queryKey: ["assigned-program", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const { data, error } = await supabase
        .from("assigned_programs")
        .select("*")
        .eq("student_id", profile.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AssignedProgram | null;
    },
    enabled: !!profile?.id,
  });

  // Генерация персональных комплексов на основе ответов анкеты и цели
  const recommendedWorkouts = useMemo(() => {
    return generatePresetWorkouts(fitnessProfile, userGlobalGoal, energyLevel);
  }, [fitnessProfile, userGlobalGoal, energyLevel]);

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
    userGlobalGoal,
    customWorkoutName,
    setCustomWorkoutName,
    selectedExercises,
    setSelectedExercises,
    savedTemplates,
    fitnessProfile,
    energyLevel,
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
    completeFitnessOnboarding,
    userGender: profile?.gender || "male",
    assignedProgram,
    recommendedWorkouts,
  };
}
