import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Log } from "./types";
import { toISODate } from "@/lib/utils/date-utils";

export const useDashboardQueries = (
  userId: string,
  serverToday: string,
  selectedDate: string,
) => {
  //  Округляем дату старта до начала месяца, чтобы стабилизировать кэш
  const fromDateDynamic = useMemo(() => {
    const selected = new Date(selectedDate);

    // Вычисляем дату 30 дней назад для базового покрытия
    const baseLimit = new Date(serverToday);
    baseLimit.setDate(baseLimit.getDate() - 30);

    // Если выбранная дата находится в пределах последних 30 дней
    if (selected >= baseLimit) {
      return toISODate(baseLimit);
    }

    // Если пользователь ушел глубже 30 дней:
    // Округляем до 1-го числа месяца выбранной даты.
    // Таким образом, сколько бы пользователь ни кликал внутри ЭТОГО месяца в прошлом,
    // fromDateDynamic не изменится, и повторного запроса в сеть не будет!
    const startOfSelectedMonth = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      1,
    );

    return toISODate(startOfSelectedMonth);
  }, [serverToday, selectedDate]);

  // Запрос логов за стабильный диапазон дат
  const logsQuery = useQuery<Log[], Error>({
    queryKey: ["student-logs-range", userId, fromDateDynamic],
    queryFn: () =>
      studentService.getLogsFromDate(userId, fromDateDynamic) as Promise<Log[]>,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 минут полной стабильности данных в памяти
  });

  const profileQuery = useUserProfile(userId);

  const history = useMemo(() => {
    return logsQuery.data || [];
  }, [logsQuery.data]);

  return {
    logsQuery,
    profileQuery,
    history,
    profile: profileQuery.data ?? null,
    fromDateDynamic,
  };
};
