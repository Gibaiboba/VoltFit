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

      // Хелпер для внедрения измененного лога в массив данных
      const updateLogEntries = (old: DailyLog[] = []): DailyLog[] => {
        const exists = old.some((l) => l.log_date === targetDate);

        // Находим понятное название активности по её ID для отображения у тренера/в истории
        const activityId = newLogData.selected_activity_id || "";
        const computedActivityName =
          activityId && ACTIVITIES_MAP[activityId]
            ? ACTIVITIES_MAP[activityId].name
            : "День без тренировок";

        if (exists) {
          return old.map((l) =>
            l.log_date === targetDate
              ? {
                  ...l,
                  ...newLogData,
                  activity_name: computedActivityName, // Обновляем виртуальное имя
                }
              : l,
          );
        }

        // Честно конструируем полноценный объект DailyLog без activity_level
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
          // Инициализируем новые колонки
          selected_activity_id: null,
          activity_duration: 0,
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

    onSuccess: () => {
      onSuccessCb();
      toast.success("Данные успешно сохранены ✨");
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
