import { useState } from "react";
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
  // 1. Локальное состояние (Дата и Ввод)
  const [selectedDate, setSelectedDate] = useState<string>(serverToday);

  // Частичный ввод пользователя (то, что он успел напечатать)
  const [userInput, setUserInput] = useState<Partial<FormDataType>>({});

  // 2. Запросы через новый слой сервисов (React Query)
  const { history, profile, logsQuery, profileQuery } =
    useDashboardQueries(userId);
  const { meals } = useMealHistory(userId);

  // 3. Математика (Расчеты на основе данных из кэша и ввода)
  const stats = useDashboardCalculations(
    history,
    profile,
    meals,
    selectedDate,
    userInput as Record<string, string | number>,
    serverToday,
  );

  // 4. Мутации (Сохранение через studentService)
  const { saveMutation } = useDashboardMutations(
    userId,
    () => setUserInput({}), // Очистка локального ввода при успехе
  );

  // 5. Обработчики действий (Actions)
  const handleDateChange = (date: string): void => {
    setSelectedDate(date);
    setUserInput({}); // Сброс ввода при переключении даты
  };

  const setFormData = (updater: FormUpdater): void => {
    if (typeof updater === "function") {
      setUserInput((prev) => {
        // Берем текущие данные (из базы или ввода) и применяем апдейтер
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
    // Конвертируем строковые данные формы в числа для сервиса (DailyLog)
    saveMutation.mutate({
      log_date: selectedDate,
      steps: parseInt(stats.formData.steps) || 0,
      weight: parseFloat(stats.formData.weight) || 0,
      calories: stats.currentCalories,
      sleep_hours: parseFloat(stats.formData.sleep_hours) || 0,
      water: stats.formData.water,
      activity_level: stats.formData.activity_level,
    });
  };

  return {
    state: {
      ...stats,
      selectedDate,
      // Умный лоадер: показываем загрузку только если данных еще нет совсем
      loading:
        (logsQuery.isLoading || profileQuery.isLoading) && history.length === 0,

      error: saveMutation.error ? getErrorMessage(saveMutation.error) : null,
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
    },
  };
};
