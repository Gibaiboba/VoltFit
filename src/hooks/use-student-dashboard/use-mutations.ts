"use client";

import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { DailyLog } from "@/types/shared";
import { ACTIVITIES_MAP } from "@/constants/activities";
import { toast } from "sonner";

interface InfiniteLogsCacheStructure {
  pages: DailyLog[][];
  pageParams: (string | undefined)[];
}

interface MutationRollbackContext {
  previousRangeQueries: [QueryKey, DailyLog[] | undefined][];
  previousInfiniteData: InfiniteLogsCacheStructure | undefined;
}

export const useDashboardMutations = (
  userId: string,
  onSuccessCb: () => void,
) => {
  const queryClient = useQueryClient();

  const serverToday = useUserStore((state) => state.selectedDate);

  const saveMutation = useMutation<
    DailyLog,
    Error,
    Partial<DailyLog>,
    MutationRollbackContext
  >({
    mutationFn: (logData) => studentService.saveLog(userId, logData),

    onMutate: async (newLogData): Promise<MutationRollbackContext> => {
      if (!newLogData.log_date) {
        throw new Error("log_date is required for optimistic updates");
      }

      const targetDate = newLogData.log_date;

      await queryClient.cancelQueries({
        queryKey: ["student-logs-range", userId],
      });
      await queryClient.cancelQueries({
        queryKey: ["student-logs-infinite", userId],
      });

      const previousRangeQueries = queryClient.getQueriesData<DailyLog[]>({
        queryKey: ["student-logs-range", userId],
      });
      const previousInfiniteData =
        queryClient.getQueryData<InfiniteLogsCacheStructure>([
          "student-logs-infinite",
          userId,
        ]);

      const updateLogEntries = (old: DailyLog[] = []): DailyLog[] => {
        const exists = old.some((l) => l.log_date === targetDate);

        const dayActivities = newLogData.activities || [];
        const computedActivityName =
          dayActivities.length > 0
            ? dayActivities
                .map((a) => {
                  const config = ACTIVITIES_MAP[a.activity_id];
                  return config
                    ? config.name.split(" ").slice(1).join(" ")
                    : "Тренировка";
                })
                .join(", ")
            : "День без тренировок";

        if (exists) {
          return old.map((l) =>
            l.log_date === targetDate
              ? { ...l, ...newLogData, activity_name: computedActivityName }
              : l,
          );
        }

        const fallbackLog: DailyLog = {
          id: crypto.randomUUID(),
          user_id: userId,
          log_date: targetDate,
          steps: 0,
          weight: 0,
          calories: 0,
          proteins: 0,
          fats: 0,
          carbs: 0,
          sleep_hours: 0,
          water: 0,
          activities: [],
          burned_calories: 0,
          activity_name: computedActivityName,
          created_at: new Date().toISOString(),
          ...newLogData,
        };

        return [fallbackLog, ...old].sort((a, b) =>
          b.log_date.localeCompare(a.log_date),
        );
      };

      queryClient.setQueriesData<DailyLog[]>(
        { queryKey: ["student-logs-range", userId] },
        (old) => updateLogEntries(old),
      );

      if (previousInfiniteData) {
        queryClient.setQueryData<InfiniteLogsCacheStructure>(
          ["student-logs-infinite", userId],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: DailyLog[]) =>
                updateLogEntries(page),
              ),
            };
          },
        );
      }

      return { previousRangeQueries, previousInfiniteData };
    },

    // автосинхронизация веса
    onSuccess: async (savedLog) => {
      onSuccessCb();
      toast.success("Данные успешно сохранены ✨");

      // Константа шага (должна совпадать с хуком расчетов)
      const WEIGHT_STEP = 3;

      // Проверяем автосинк веса, только если это отчет за СЕГОДНЯ
      if (savedLog.log_date === serverToday && savedLog.weight) {
        try {
          // 1. Достаем ТЕКУЩИЙ профиль из кэша ДО обновления, чтобы узнать старый базовый вес
          const currentProfile = queryClient.getQueryData<{
            weight: number;
            goal: string;
          }>(["user-profile", userId]);

          const startWeight = currentProfile?.weight || 70;
          const currentGoal = currentProfile?.goal || "maintain";

          // Вычисляем чистый сдвиг веса в ступенях
          const weightDifference = savedLog.weight - startWeight;
          const stepsCount = Math.round(weightDifference / WEIGHT_STEP);

          // Проверяем, является ли сдвиг победой по отношению к глобальной цели
          let isVictory = false;
          if (currentGoal === "lose_weight" && stepsCount < 0) isVictory = true;
          if (currentGoal === "gain_muscle" && stepsCount > 0) isVictory = true;
          if (currentGoal === "maintain" && stepsCount !== 0) isVictory = true;

          // 2. Отправляем новый вес в profiles на бэкенд
          const { error: profileUpdateError } = await supabase
            .from("profiles")
            .update({ weight: savedLog.weight })
            .eq("id", userId);

          if (profileUpdateError) throw profileUpdateError;

          // 3. Инвалидируем кэш, чтобы всё приложение перестроилось под новый базовый вес
          await queryClient.invalidateQueries({
            queryKey: ["user-profile", userId],
          });

          // 4. 💡 ВЫБРАСЫВАЕМ ТОСТ СТРОГО ПОСЛЕ СХРАНЕНИЯ, ЕСЛИ ЭТО РЕАЛЬНЫЙ ШАГ В 3 КГ
          if (isVictory && stepsCount !== 0) {
            const direction = stepsCount < 0 ? "снизился" : "увеличился";

            // Защищаем тост от дублирования через жесткий id
            toast.info(
              `Супер прогресс! Твой базовый вес ${direction} на ${Math.abs(stepsCount * WEIGHT_STEP)} кг. Мы бережно адаптировали твой КБЖУ 🚀`,
              {
                id: "recalculated-victory-toast",
                duration: 6000,
              },
            );
          }
        } catch (syncError) {
          console.error("Ошибка автосинхронизации веса с профилем:", syncError);
        }
      }
    },

    onError: (err, _variables, context) => {
      if (context?.previousRangeQueries) {
        context.previousRangeQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      if (context?.previousInfiniteData) {
        queryClient.setQueryData(
          ["student-logs-infinite", userId],
          context.previousInfiniteData,
        );
      }
      toast.error("Не удалось сохранить данные. Проверьте подключение к сети.");
      console.error("Mutation Error:", err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-logs-range", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-logs-infinite", userId],
      });
    },
  });

  return { saveMutation };
};
