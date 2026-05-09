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

  // Локальное состояние для черновика ввода
  const [userInput, setUserInput] = useState<Partial<FormDataType>>({});

  // 2. Запросы через React Query
  const { history, profile, logsQuery, profileQuery } =
    useDashboardQueries(userId);

  // Вызываем без selectedDate, как договорились в рамках оптимизации кэша
  const { meals } = useMealHistory(userId);

  // 3. Математика (Расчеты на основе данных из кэша, еды и ввода)
  const stats = useDashboardCalculations(
    history,
    profile,
    meals,
    selectedDate,
    userInput as Record<string, string | number>,
    serverToday,
  );

  // 4. Мутации (Сохранение)
  const { saveMutation } = useDashboardMutations(
    userId,
    () => setUserInput({}), // Очистка локального ввода при успехе сохранения
  );

  // 5. Обработчики действий (Actions)
  const handleDateChange = (date: string): void => {
    setSelectedDate(date); // Меняем дату в глобальном сторе
    setUserInput({}); // Сбрасываем черновик ввода при переходе на другой день
  };

  // Функция для одновременного перезапуска всех тяжелых запросов дашборда
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
      loading:
        (logsQuery.isLoading || profileQuery.isLoading) && history.length === 0,
      // Приоритизация ошибок: мутация -> запросы
      error: saveMutation.error
        ? getErrorMessage(saveMutation.error)
        : logsQuery.error || profileQuery.error
          ? getErrorMessage(logsQuery.error || profileQuery.error)
          : null,
      history,
      profile,
      isSaving: saveMutation.isPending,
      todayStr: serverToday,
    },
    actions: {
      handleDateChange,
      handleSave,
      setFormData,
      addWater,
      removeWater,
      refetch: handleRefetchAll, // Передаем экшен перезапуска в компонент
    },
  };
};
