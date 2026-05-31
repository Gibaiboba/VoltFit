import { useState, useCallback } from "react";
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

  // Локальное состояние для черновика ввода (веса, шагов, сна, тренировок)
  const [userInput, setUserInput] = useState<Partial<FormDataType>>({});

  // 2. Запросы через React Query (с новой блочной логикой кэширования по месяцам)
  const { history, profile, logsQuery, profileQuery, fromDateDynamic } =
    useDashboardQueries(userId, serverToday, selectedDate);

  // Синхронизируем еду по тому же самому диапазону дат
  const { meals } = useMealHistory(userId, fromDateDynamic);

  // 3. Расчеты на основе кэша и пользовательского ввода (уже учитывают новые поля и MET)
  const stats = useDashboardCalculations(
    history,
    profile,
    meals,
    selectedDate,
    userInput as Record<string, string | number>,
    serverToday,
  );

  // 4. Мутации (с мгновенными оптимистичными обновлениями для range и infinite кэша)
  const { saveMutation } = useDashboardMutations(
    userId,
    useCallback(() => setUserInput({}), []), // Очистка черновика при успехе
  );

  // 5. Обработчики действий (Actions) с оптимизацией быстродействия через useCallback
  const handleDateChange = useCallback(
    (date: string): void => {
      setSelectedDate(date); // Меняем дату в Zustand-сторе
      setUserInput({}); // Сбрасываем локальный черновик при переходе на другой день
    },
    [setSelectedDate],
  );

  const handleRefetchAll = useCallback(async (): Promise<void> => {
    await Promise.all([logsQuery.refetch(), profileQuery.refetch()]);
  }, [logsQuery, profileQuery]);

  const setFormData = useCallback(
    (updater: FormUpdater): void => {
      if (typeof updater === "function") {
        setUserInput((prev) => {
          // Передаем в коллбэк объединенное состояние для точечного обновления
          const next = updater({ ...stats.formData, ...prev });
          return { ...prev, ...next };
        });
      } else {
        setUserInput((prev) => ({ ...prev, ...updater }));
      }
    },
    [stats.formData],
  );

  // Безопасное добавление воды на основе актуальных вычисленных данных дня
  const addWater = useCallback((): void => {
    const currentWater = Number(stats.formData.water) || 0;
    setUserInput((prev) => ({
      ...prev,
      water: currentWater + 250,
    }));
  }, [stats.formData.water]);

  // Безопасное удаление воды
  const removeWater = useCallback((): void => {
    const currentWater = Number(stats.formData.water) || 0;
    setUserInput((prev) => ({
      ...prev,
      water: Math.max(0, currentWater - 250),
    }));
  }, [stats.formData.water]);

  // ИСПРАВЛЕНО: Теперь передаем новые поля активности в мутацию сохранения
  const handleSave = useCallback((): void => {
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

      // Передаем реляционные параметры активности
      selected_activity_id: stats.formData.selected_activity_id || null,
      activity_duration: parseInt(stats.formData.activity_duration) || 0,
      burned_calories: stats.burnedCalories,
    });
  }, [selectedDate, stats, saveMutation]);
  return {
    state: {
      ...stats,
      // Загрузка активна только при первичном запросе диапазона, если в кэше пусто
      burnedCalories: stats.burnedCalories,
      loading:
        (logsQuery.isLoading || profileQuery.isLoading) && history.length === 0,

      // Вывод ошибок: мутации в приоритете, затем ошибки чтения
      error: saveMutation.error
        ? getErrorMessage(saveMutation.error)
        : logsQuery.error || profileQuery.error
          ? getErrorMessage(logsQuery.error || (profileQuery.error as Error))
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
      refetch: handleRefetchAll,
    },
  };
};
