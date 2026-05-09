// hooks/use-student-dashboard/use-queries.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { DailyLog } from "@/types/shared";
import { useUserProfile } from "@/hooks/use-user-profile";

export const useDashboardQueries = (userId: string) => {
  // 1. Загрузка истории логов
  const logsQuery = useQuery<DailyLog[]>({
    queryKey: ["student-logs", userId],
    queryFn: () => studentService.getLogs(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Передаем userId явно, чтобы React Query точно знал, чей профиль кэшировать
  const profileQuery = useUserProfile(userId);

  // 3. Сортировка истории
  const history = useMemo(() => {
    const data = logsQuery.data || [];
    // Используем localeCompare для надежной сортировки строк YYYY-MM-DD
    return [...data].sort((a, b) => b.log_date.localeCompare(a.log_date));
  }, [logsQuery.data]);

  return {
    logsQuery,
    profileQuery,
    history,
    profile: profileQuery.data ?? null, // Используем ?? для чистоты
    // Используем isPending вместо isLoading, если хочешь ловить самое первое состояние загрузки
    isLoading: logsQuery.isLoading || profileQuery.isLoading,
  };
};
