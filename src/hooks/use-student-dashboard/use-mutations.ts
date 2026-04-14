import { useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { DailyLog } from "@/types/shared";
import { MutationContext } from "./types";
import { toast } from "sonner";

export const useDashboardMutations = (
  userId: string,
  onSuccessCb: () => void,
) => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation<
    void,
    Error,
    Partial<DailyLog>,
    MutationContext
  >({
    // 1. Используем метод сервиса вместо прямого вызова supabase
    mutationFn: (logData) => studentService.saveLog(userId, logData),

    onMutate: async (newLogData) => {
      // Отменяем исходящие запросы, чтобы они не перезаписали наш оптимистичный стейт
      await queryClient.cancelQueries({ queryKey: ["student-logs", userId] });

      // Сохраняем предыдущее состояние для отката при ошибке
      const previousLogs = queryClient.getQueryData<DailyLog[]>([
        "student-logs",
        userId,
      ]);

      // Оптимистично обновляем кэш
      queryClient.setQueryData<DailyLog[]>(
        ["student-logs", userId],
        (old = []) => {
          const exists = old.some((l) => l.log_date === newLogData.log_date);

          if (exists) {
            return old.map((l) =>
              l.log_date === newLogData.log_date
                ? ({ ...l, ...newLogData } as DailyLog)
                : l,
            );
          }

          return [newLogData as DailyLog, ...old].sort(
            (a, b) =>
              new Date(b.log_date).getTime() - new Date(a.log_date).getTime(),
          );
        },
      );

      return { previousLogs };
    },

    onSuccess: () => {
      onSuccessCb();
      toast.success("Данные успешно сохранены ✨");
    },

    onError: (err, _newLog, context) => {
      // Если произошла ошибка — откатываем данные к тем, что были до мутации
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["student-logs", userId],
          context.previousLogs,
        );
      }
      toast.error("Не удалось сохранить данные");
      console.error("Mutation Error:", err);
    },

    onSettled: () => {
      // В любом случае (успех или ошибка) синхронизируем данные с сервером
      queryClient.invalidateQueries({ queryKey: ["student-logs", userId] });
    },
  });

  return { saveMutation };
};
