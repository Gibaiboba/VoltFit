"use client";

import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
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

      // 1. Отменяем текущие запросы, чтобы они не перезаписали оптимистичный стейт
      await queryClient.cancelQueries({
        queryKey: ["student-logs-range", userId],
      });
      await queryClient.cancelQueries({
        queryKey: ["student-logs-infinite", userId],
      });

      // 2. Делаем снимок текущих данных для отката при ошибке
      const previousRangeQueries = queryClient.getQueriesData<DailyLog[]>({
        queryKey: ["student-logs-range", userId],
      });
      const previousInfiniteData =
        queryClient.getQueryData<InfiniteLogsCacheStructure>([
          "student-logs-infinite",
          userId,
        ]);

      // Хелпер для внедрения измененного лога в массивы кэша
      const updateLogEntries = (old: DailyLog[] = []): DailyLog[] => {
        const exists = old.some((l) => l.log_date === targetDate);

        // Конструируем красивую текстовую сводку из массива активностей для графиков и тренера
        const dayActivities = newLogData.activities || [];
        const computedActivityName =
          dayActivities.length > 0
            ? dayActivities
                .map((a) => {
                  const config = ACTIVITIES_MAP[a.activity_id];
                  // Вырезаем эмодзи для аккуратности строки в истории
                  return config
                    ? config.name.split(" ").slice(1).join(" ")
                    : "Тренировка";
                })
                .join(", ")
            : "День без тренировок";

        // Если запись за эту дату уже была — обновляем её поля
        if (exists) {
          return old.map((l) =>
            l.log_date === targetDate
              ? {
                  ...l,
                  ...newLogData,
                  activity_name: computedActivityName,
                }
              : l,
          );
        }

        // Если это новая дата — конструируем полноценный строгий объект DailyLog
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
          activities: [], // Инициализируем jsonb-массив тренировок
          burned_calories: 0, // Инициализируем итоговую сумму калорий
          activity_name: computedActivityName,
          created_at: new Date().toISOString(),

          // Разворачиваем новые данные пользователя поверх дефолтных
          ...newLogData,
        };

        return [fallbackLog, ...old].sort((a, b) =>
          b.log_date.localeCompare(a.log_date),
        );
      };

      // 3. Записываем оптимистичные данные в кэш диапазона дат дашборда
      queryClient.setQueriesData<DailyLog[]>(
        { queryKey: ["student-logs-range", userId] },
        (old) => updateLogEntries(old),
      );

      // 4. Записываем оптимистичные данные в кэш бесконечной истории (если он инициализирован)
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

      // Возвращаем контекст с прошлыми данными
      return { previousRangeQueries, previousInfiniteData };
    },

    onSuccess: () => {
      onSuccessCb();
      toast.success("Данные успешно сохранены ✨");
    },

    onError: (err, _variables, context) => {
      // При ошибке сети полностью восстанавливаем старые данные из контекста снимка
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
      // Инвалидируем кэш для финальной синхронизации данных с сервером Supabase
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
