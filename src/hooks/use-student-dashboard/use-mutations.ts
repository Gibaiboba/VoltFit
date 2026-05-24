import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { DailyLog } from "@/types/shared";
import { toast } from "sonner";

// Описываем структуру данных для кэша бесконечного запроса (Infinite Query)
interface InfiniteLogsCacheStructure {
  pages: DailyLog[][];
  pageParams: (string | undefined)[];
}

// Описываем строго типизированный контекст для безопасного отката (Rollback Context)
interface MutationRollbackContext {
  previousRangeQueries: [QueryKey, DailyLog[] | undefined][];
  previousInfiniteData: InfiniteLogsCacheStructure | undefined;
}

export const useDashboardMutations = (
  userId: string,
  onSuccessCb: () => void,
) => {
  const queryClient = useQueryClient();

  // Передаем дженерики: <ТипОтвета, ТипОшибки, ТипВходящихПеременных, ТипКонтекста>
  const saveMutation = useMutation<
    DailyLog,
    Error,
    Partial<DailyLog>,
    MutationRollbackContext
  >({
    // 1. Вызываем метод сервиса
    mutationFn: (logData) => studentService.saveLog(userId, logData),

    onMutate: async (newLogData): Promise<MutationRollbackContext> => {
      // Валидация на наличие даты для обеспечения строгой типобезопасности без as
      if (!newLogData.log_date) {
        throw new Error("log_date is required for optimistic updates");
      }

      const targetDate = newLogData.log_date;

      // Отменяем текущие запросы, чтобы сервер не перебил наш оптимистичный стейт
      await queryClient.cancelQueries({
        queryKey: ["student-logs-range", userId],
      });
      await queryClient.cancelQueries({
        queryKey: ["student-logs-infinite", userId],
      });

      // Делаем снимок текущего кэша для безопасного отката (Rollback) при сбое сети
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
        if (exists) {
          return old.map((l) =>
            l.log_date === targetDate ? { ...l, ...newLogData } : l,
          );
        }

        // Честно конструируем полноценный объект DailyLog со всеми обязательными полями без Type Assertion
        const fallbackLog: DailyLog = {
          id: crypto.randomUUID(), // Временный клиентский UUID
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
          activity_level: "День без тренировок",
          created_at: new Date().toISOString(),
          ...newLogData, // Накатываем переданные изменения
        };

        return [fallbackLog, ...old].sort((a, b) =>
          b.log_date.localeCompare(a.log_date),
        );
      };

      // МГНОВЕННОЕ ОБНОВЛЕНИЕ ДАШБОРДА (всех кэшей диапазонов)
      queryClient.setQueriesData<DailyLog[]>(
        { queryKey: ["student-logs-range", userId] },
        (old) => updateLogEntries(old),
      );

      // МГНОВЕННОЕ ОБНОВЛЕНИЕ ЛЕНТЫ ИСТОРИИ (структура бесконечного запроса)
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

      // Возвращаем контекст с бэкапами данных
      return { previousRangeQueries, previousInfiniteData };
    },

    onSuccess: () => {
      onSuccessCb();
      toast.success("Данные успешно сохранены ✨");
    },

    onError: (err, _variables, context) => {
      // Если сеть упала — мгновенно возвращаем старые данные на экран
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
      // В фоне тихо сверяем кэш с бэкендом (без лоадеров на экране)
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
