"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";
import { useDashboardMutations } from "@/hooks/use-student-dashboard/use-mutations";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useUserStore } from "@/store/useUserStore";
import { useServerToday } from "@/providers/DateProvider";
import { DailyLog } from "@/types/shared";

export function useFinishWorkout() {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.id) || "";
  const { data: profile } = useUserProfile(userId);
  const serverToday = useServerToday();
  const { saveMutation } = useDashboardMutations(userId, () => {});

  const userWeight = Number(profile?.weight) || 70;

  const { mutateAsync: mutateSaveWorkoutLog } = useMutation({
    mutationFn: async (payload: {
      name: string;
      exercises: unknown[];
      duration: number;
      calories: number;
      totalVolume: number;
    }) => {
      if (!userId) throw new Error("Пользователь не авторизован");

      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          user_id: userId,
          name: payload.name,
          exercises: payload.exercises,
          duration: payload.duration,
          burned_calories: payload.calories,
          total_volume: payload.totalVolume,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });

  const finishActiveWorkout = async (finalDuration: number) => {
    try {
      if (!userId) return;

      // Берём актуальные данные прямо из стора в момент завершения
      const { customWorkoutName, selectedExercises } =
        useActiveWorkoutStore.getState();

      const totalVolumeLoad = selectedExercises.reduce((totalEx, ex) => {
        const exVolume = ex.sets.reduce((totalSet, set) => {
          const w = parseFloat(set.weight) || 0;
          const r = parseInt(set.reps) || 0;
          return totalSet + (set.done ? w * r : 0);
        }, 0);
        return totalEx + exVolume;
      }, 0);

      const avgMet =
        selectedExercises.length > 0
          ? selectedExercises.reduce((sum, ex) => sum + ex.met, 0) /
            selectedExercises.length
          : 5;

      const finalCalories = Math.round(
        avgMet * 3.5 * (userWeight / 200) * finalDuration,
      );

      // 1. Сохраняем детальный лог в workout_logs
      const savedWorkoutLog = await mutateSaveWorkoutLog({
        name: customWorkoutName,
        exercises: selectedExercises,
        duration: finalDuration,
        calories: finalCalories,
        totalVolume: totalVolumeLoad,
      });

      // 2. Обновляем дневник в daily_logs
      const allRangeQueries = queryClient.getQueriesData<DailyLog[]>({
        queryKey: ["student-logs-range", userId],
      });
      const cachedLogs = allRangeQueries[0]?.[1] || [];
      const todayLogFromCache = cachedLogs.find(
        (l) => l.log_date === serverToday,
      );

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

      const totalDayBurnedCalories = updatedActivities.reduce(
        (sum, act) => sum + (Number(act.burned_calories) || 0),
        0,
      );

      await saveMutation.mutateAsync({
        log_date: serverToday,
        activities: updatedActivities,
        burned_calories: totalDayBurnedCalories,
        steps: todayLogFromCache?.steps || 0,
        weight: todayLogFromCache?.weight || undefined,
        water: todayLogFromCache?.water || 0,
        sleep_hours: todayLogFromCache?.sleep_hours || 0,
      });

      toast.success(
        "Тренировка сохранена! КБЖУ в дневнике успешно обновлен 🚀",
      );
    } catch (error) {
      console.error("Ошибка при завершении тренировки:", error);
      toast.error("Не удалось завершить тренировку. Проверьте сеть.");
      throw error; // Пробрасываем выше, чтобы стор не очистился при ошибке сети
    }
  };

  queryClient.invalidateQueries({ queryKey: ["workout-logs", userId] });

  return { finishActiveWorkout };
}
