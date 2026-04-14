import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { DailyLog } from "@/types/shared"; // Наш новый единый тип
import { UserProfile } from "@/types/user";

export const useDashboardQueries = (userId: string) => {
  // 1. Загрузка истории логов через сервис
  const logsQuery = useQuery<DailyLog[]>({
    queryKey: ["student-logs", userId],
    queryFn: () => studentService.getLogs(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Данные считаются свежими 5 минут
  });

  // 2. Загрузка профиля через сервис
  const profileQuery = useQuery<UserProfile | null>({
    queryKey: ["user-profile", userId],
    queryFn: () => studentService.getProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // Профиль меняется редко, можно кэшировать дольше
  });

  return {
    logsQuery,
    profileQuery,
    history: logsQuery.data || [],
    profile: profileQuery.data || null,
    // Используем status для более точного определения загрузки первого раза
    isLoading: logsQuery.isLoading || profileQuery.isLoading,
  };
};
