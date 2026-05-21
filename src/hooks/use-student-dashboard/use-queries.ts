import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Log } from "./types";
import { toISODate } from "@/lib/utils/date-utils"; // Импортируем утилиту перевода дат

export const useDashboardQueries = (
  userId: string,
  serverToday: string,
  selectedDate: string,
) => {
  // УМНОЕ РАСШИРЕНИЕ: Вычисляем динамическую дату старта
  const fromDateDynamic = useMemo(() => {
    const today = new Date(serverToday);
    const selected = new Date(selectedDate);

    // Базовый вариант: 30 дней назад от сегодняшнего дня
    today.setDate(today.getDate() - 30);

    // Если пользователь на календаре ушел глубже, чем базовые 30 дней назад
    if (selected < today) {
      // Сдвигаем границу кэша еще на 15 дней назад от ВЫБРАННОЙ даты (чтобы дать запас для кликов рядом)
      selected.setDate(selected.getDate() - 15);
      return toISODate(selected);
    }

    // Если кликаем внутри последнего месяца — дата старта стабильна (запросов в сеть нет)
    return toISODate(today);
  }, [serverToday, selectedDate]);

  // 1. Бесконечная загрузка логов порциями (для страницы истории)
  const logsInfiniteQuery = useInfiniteQuery<Log[], Error>({
    queryKey: ["student-logs-infinite", userId],
    queryFn: async ({ pageParam }) => {
      const data = await studentService.getLogsPaged(
        userId,
        pageParam as string,
        20,
      );
      return data as Log[];
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return lastPage[lastPage.length - 1].log_date;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const profileQuery = useUserProfile(userId);

  const history = useMemo(() => {
    return logsInfiniteQuery.data?.pages.flat() || [];
  }, [logsInfiniteQuery.data]);

  return {
    logsQuery: logsInfiniteQuery,
    profileQuery,
    history,
    profile: profileQuery.data ?? null,
    isLoading: logsInfiniteQuery.isLoading || profileQuery.isLoading,
    fromDateDynamic, // Пробрасываем вычисленную динамическую дату наружу для еды
  };
};
