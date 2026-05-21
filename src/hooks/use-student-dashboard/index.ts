import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useDashboardQueries } from "./use-queries";
import { useDashboardMutations } from "./use-mutations";
import { useDashboardCalculations } from "./use-calculations";
import { FormDataType, StudentDashboardHook, FormUpdater } from "./types";
import { getErrorMessage } from "@/lib/utils/error-helper";

export const useStudentDashboard = (
  userId: string,
  serverToday: string,
): StudentDashboardHook => {
  // 1. Глобальное состояние даты из Zustand
  const { selectedDate, setSelectedDate } = useUserStore();

  // Локальное состояние для черновика ввода (веса, шагов, сна)
  const [userInput, setUserInput] = useState<Partial<FormDataType>>({});

  // 2. Запросы через React Query логов и профиля (с логикой умного расширения диапазона)
  const { history, profile, logsQuery, profileQuery, fromDateDynamic } =
    useDashboardQueries(userId, serverToday, selectedDate);

  // Синхронизируем еду: передаем ту же динамическую дату, чтобы кэш калорий и БЖУ расширялся вместе с календарем
  const { meals } = useMealHistory(userId, fromDateDynamic);

  // 3. Математика и расчеты (на основе данных из кэша, еды и пользовательского ввода)
  const stats = useDashboardCalculations(
    history,
    profile,
    meals,
    selectedDate,
    userInput as Record<string, string | number>,
    serverToday,
  );

  // 4. Мутации (Сохранение отчетов в базу данных Supabase)
  const { saveMutation } = useDashboardMutations(
    userId,
    () => setUserInput({}), // Очистка локального черновика ввода при успешном сохранении
  );

  // 5. Обработчики действий (Actions)
  const handleDateChange = (date: string): void => {
    setSelectedDate(date); // Меняем дату в глобальном Zustand-сторе
    setUserInput({}); // Полностью сбрасываем черновик ввода при переходе на другой день
  };

  // Функция для одновременного перезапуска всех тяжелых запросов дашборда при ошибке в AsyncBoundary
  const handleRefetchAll = async (): Promise<void> => {
    await Promise.all([logsQuery.refetch(), profileQuery.refetch()]);
  };

  const setFormData = (updater: FormUpdater): void => {
    if (typeof updater === "function") {
      setUserInput((prev) => {
        const next = updater(stats.formData);
        return { ...prev, ...next };
      });
    } else {
      setUserInput((prev) => ({ ...prev, ...updater }));
    }
  };

  const addWater = (): void => {
    setFormData((prev) => ({
      water: (Number(prev.water) || 0) + 250,
    }));
  };

  const removeWater = (): void => {
    setFormData((prev) => ({
      water: Math.max(0, (Number(prev.water) || 0) - 250),
    }));
  };

  const handleSave = (): void => {
    saveMutation.mutate({
      log_date: selectedDate,
      steps: parseInt(stats.formData.steps) || 0,
      weight: parseFloat(stats.formData.weight) || 0,
      calories: stats.currentCalories,
      proteins: stats.currentProteins,
      fats: stats.currentFats,
      carbs: stats.currentCarbs,
      sleep_hours: parseFloat(stats.formData.sleep_hours) || 0,
      water: stats.formData.water,
      activity_level: stats.formData.activity_level,
    });
  };

  return {
    state: {
      ...stats,
      // Флаг загрузки: активен, только если идет первичный запрос и данных в истории еще нет
      loading:
        (logsQuery.isLoading || profileQuery.isLoading) && history.length === 0,

      // Приоритизация вывода ошибок: сначала ошибки сохранения отчета, затем ошибки загрузки
      error: saveMutation.error
        ? getErrorMessage(saveMutation.error)
        : logsQuery.error || profileQuery.error
          ? getErrorMessage(logsQuery.error || (profileQuery.error as Error))
          : null,

      history,
      profile,
      isSaving: saveMutation.isPending,
      todayStr: serverToday,

      // Пробрасываем сам объект InfiniteQuery наружу для управления бесконечным скроллом в HistoryLogPage
      logsQuery: logsQuery,
    },
    actions: {
      handleDateChange,
      handleSave,
      setFormData,
      addWater,
      removeWater,
      refetch: handleRefetchAll,
    },
  };
};
