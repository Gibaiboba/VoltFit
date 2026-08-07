import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { studentService } from "@/services/student.service";
import { calculateDynamicWaterTarget } from "@/lib/utils/waterCalculator";
import { toISODate } from "@/lib/utils/date-utils";
import { DailyLog } from "@/types/shared";
import { UserProfile } from "@/types/user";

export const useWaterTracker = (serverToday: string) => {
  const queryClient = useQueryClient();

  // 1. Глобальное состояние из Zustand
  const selectedDate = useUserStore((state) => state.selectedDate);
  const user = useUserStore((state) => state.user);
  const userId = user?.id || "";

  // 2. Стабильное квантование даты (один в один как в useDiaryLogic)
  const fromDateDynamic = useMemo(() => {
    const today = new Date(serverToday);
    const selected = new Date(selectedDate);
    today.setDate(today.getDate() - 30);

    if (selected < today) {
      const yearMonth = selectedDate.slice(0, 7);
      return `${yearMonth}-01`;
    }
    return toISODate(today);
  }, [serverToday, selectedDate]);

  const logsKey = ["student-logs-range", userId, fromDateDynamic];
  const profileKey = ["user-profile", userId];

  // 3. Активный и чистый запрос логов.
  // Благодаря staleTime: 5 минут, если useDiaryLogic уже скачал данные,
  // этот хук мгновенно (за 0 мс) возьмет их из памяти БЕЗ повторного запроса в сеть.
  const { data: history = [] } = useQuery<DailyLog[], Error>({
    queryKey: logsKey,
    queryFn: () => studentService.getLogsFromDate(userId, fromDateDynamic),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Совпадает с вашим глобальным кэшем дашборда
  });

  // 4. Активный и чистый запрос профиля
  const { data: profile = null } = useQuery<UserProfile | null, Error>({
    queryKey: profileKey,
    queryFn: () => studentService.getProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // 5. Поиск текущего дня и расчеты в мемо-слое (работает реактивно и быстро)
  const currentLog = useMemo(() => {
    return history.find((l) => l.log_date === selectedDate) || null;
  }, [history, selectedDate]);

  const currentWater = currentLog?.water || 0;
  // Оборачиваем шаги в useMemo, чтобы стабилизировать значение

  const currentSteps = useMemo(() => {
    return currentLog?.steps || 0;
  }, [currentLog?.steps]);

  // Оборачиваем массив активностей в useMemo.
  // Теперь ссылка на массив изменится ТОЛЬКО если изменятся реальные данные в кэше БД.
  const currentActivities = useMemo(() => {
    return currentLog?.activities || [];
  }, [currentLog?.activities]);

  //  Расчет динамической цели теперь работает идеально и не перезапускается вхолостую
  const targetWater = useMemo(() => {
    return calculateDynamicWaterTarget(
      profile,
      currentSteps,
      currentActivities,
    );
  }, [profile, currentSteps, currentActivities]);

  // 6. Чистая типизированная мутация с оптимистичным обновлением
  const waterMutation = useMutation<
    DailyLog,
    Error,
    number,
    { previousLogs: DailyLog[] | undefined }
  >({
    mutationFn: async (nextWaterValue: number) => {
      if (!userId) throw new Error("Пользователь не авторизован");
      return studentService.saveLog(userId, {
        log_date: selectedDate,
        water: nextWaterValue,
      });
    },
    onMutate: async (nextWaterValue) => {
      await queryClient.cancelQueries({ queryKey: logsKey });
      const previousLogs = queryClient.getQueryData<DailyLog[]>(logsKey);

      queryClient.setQueryData<DailyLog[]>(logsKey, (oldLogs = []) => {
        const hasLog = oldLogs.some((l) => l.log_date === selectedDate);
        if (hasLog) {
          return oldLogs.map((l) =>
            l.log_date === selectedDate ? { ...l, water: nextWaterValue } : l,
          );
        } else {
          return [
            {
              log_date: selectedDate,
              water: nextWaterValue,
              user_id: userId,
            } as DailyLog,
            ...oldLogs,
          ];
        }
      });

      return { previousLogs };
    },
    onError: (_err, _newAmount, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(logsKey, context.previousLogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: logsKey });
    },
  });

  const handleUpdateWater = (amountChange: number) => {
    if (!userId) return;
    const nextAmount = Math.max(0, currentWater + amountChange);
    waterMutation.mutate(nextAmount);
  };

  return {
    target: targetWater,
    current: currentWater,
    updateWater: handleUpdateWater,
    isPending: waterMutation.isPending,
    disabled: !userId,
  };
};
