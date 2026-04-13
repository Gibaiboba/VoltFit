import { useState } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useDashboardQueries } from "./use-queries";
import { useDashboardMutations } from "./use-mutations";
import { useDashboardCalculations } from "./use-calculations";
import { FormDataType, StudentDashboardHook, FormUpdater } from "./types";

export const useStudentDashboard = (
  userId: string,
  serverToday: string,
): StudentDashboardHook => {
  // 1. Локальное состояние (Дата и Ввод)
  const [selectedDate, setSelectedDate] = useState<string>(serverToday);

  // Типизируем объект ввода: ключи — строки из FormDataType, значения — строка или число
  const [userInput, setUserInput] = useState<
    Record<keyof FormDataType, string | number | undefined>
  >({} as Record<keyof FormDataType, string | number | undefined>);

  // 2. Запросы (Данные из БД)
  const { history, profile, logsQuery, profileQuery } =
    useDashboardQueries(userId);
  const { meals } = useMealHistory(userId);

  // 3. Расчеты (Вся математика вынесена в отдельный хук)
  const stats = useDashboardCalculations(
    history,
    profile,
    meals,
    selectedDate,
    userInput as Record<string, string | number>, // Приведение для совместимости с внутренними расчетами
    serverToday,
  );

  // 4. Мутации (Сохранение)
  const { saveMutation } = useDashboardMutations(userId, () =>
    setUserInput({} as Record<keyof FormDataType, string | number | undefined>),
  );

  // 5. Обработчики действий (Actions)
  const handleDateChange = (date: string): void => {
    setSelectedDate(date);
    setUserInput({} as Record<keyof FormDataType, string | number | undefined>);
  };

  const setFormData = (updater: FormUpdater): void => {
    if (typeof updater === "function") {
      setUserInput((prev) => {
        // Чтобы updater работал корректно, он получает текущую заполненную форму
        const next = updater(stats.formData);
        return { ...prev, ...next };
      });
    } else {
      setUserInput((prev) => ({ ...prev, ...updater }));
    }
  };

  const addWater = (): void => {
    // Используем функциональный апдейтер для точности
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
      sleep_hours: parseFloat(stats.formData.sleep_hours) || 0,
      water: stats.formData.water,
      activity_level: stats.formData.activity_level,
    });
  };

  return {
    state: {
      ...stats,
      selectedDate,
      loading:
        (logsQuery.isLoading || profileQuery.isLoading) && history.length === 0,
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
