"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { studentService } from "@/services/student.service";
import { WorkoutExercise } from "@/types/workout";

export interface WorkoutLogRecord {
  id: string;
  user_id: string;
  name: string;
  exercises: WorkoutExercise[];
  duration: number;
  burned_calories: number;
  total_volume: number;
  created_at: string;
}

export function useWorkoutHistory(userId?: string) {
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery<WorkoutLogRecord[]>({
    queryKey: ["workout-logs", userId],
    queryFn: () => studentService.getWorkoutLogs(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут считаем данные свежими
  });

  const { mutate: deleteLog, isPending: isDeleting } = useMutation({
    mutationFn: (logId: string) => {
      if (!userId) throw new Error("Пользователь не авторизован");
      return studentService.deleteWorkoutLogAndSyncDaily(userId, logId);
    },
    onMutate: async (logId) => {
      // 1. Отменяем текущие фоновые запросы истории, чтобы они не перезаписали оптимистичный кэш
      await queryClient.cancelQueries({ queryKey: ["workout-logs", userId] });

      // 2. Сохраняем снимок текущего списка на случай отката при ошибке
      const previousLogs = queryClient.getQueryData<WorkoutLogRecord[]>([
        "workout-logs",
        userId,
      ]);

      // 3. Мгновенно убираем удаляемую тренировку из UI
      queryClient.setQueryData<WorkoutLogRecord[]>(
        ["workout-logs", userId],
        (old) => (old ? old.filter((item) => item.id !== logId) : []),
      );

      return { previousLogs };
    },
    onSuccess: () => {
      toast.success("Тренировка удалена из истории и дневника");
    },
    onError: (_error, _logId, context) => {
      // 4. Откатываем кэш назад, если запрос в Supabase завершился ошибкой
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["workout-logs", userId],
          context.previousLogs,
        );
      }
      toast.error("Не удалось удалить тренировку");
    },
    onSettled: () => {
      // 5. Синхронизируем кэши истории, трекера и дневника с актуальным состоянием БД
      queryClient.invalidateQueries({ queryKey: ["workout-logs", userId] });
      queryClient.invalidateQueries({
        queryKey: ["student-logs-range", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-logs-infinite", userId],
      });
    },
  });

  return {
    logs,
    isLoading,
    deleteLog,
    isDeleting,
  };
}
