// hooks/use-diary-logic.ts
import { useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { sortMeals } from "@/lib/utils/meal-utils";
import { useNutritionStats } from "./use-nutrition-stats";
import { getErrorMessage } from "@/lib/utils/error-helper";

export function useDiaryLogic(selectedDate: string) {
  // 1. Загружаем данные еды
  const {
    meals,
    isLoading: mealsLoading,
    error: mealsError,
    refetch: refetchMeals,
    deleteMeal,
    removeItem,
  } = useMealHistory();

  // 2. Загружаем данные профиля и вытаскиваем ошибку
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useUserProfile();

  // 3. Формируем цели на основе профиля
  const goals = useMemo(
    () => ({
      kcal: profile?.daily_calories || 2000,
      p: profile?.protein || 0,
      f: profile?.fat || 0,
      c: profile?.carbs || 0,
    }),
    [profile],
  );

  // 4. Используем общий хук для расчетов
  const { dayMeals, progress, roundedStats } = useNutritionStats(
    meals,
    selectedDate,
    goals.kcal,
  );

  // Функция для одновременного перезапуска обоих запросов при клике на кнопку в AsyncBoundary
  const handleRefetchAll = async (): Promise<void> => {
    await Promise.all([refetchMeals(), refetchProfile()]);
  };

  // Комбинируем и приоритизируем ошибки через getErrorMessage
  const combinedError = useMemo(() => {
    const activeError = mealsError || profileError;
    return activeError ? getErrorMessage(activeError) : null;
  }, [mealsError, profileError]);

  return {
    // Данные для отображения
    displayMeals: sortMeals(dayMeals),
    allMeals: meals,
    consumed: roundedStats,
    goals,
    progress,

    // Статусы
    isLoading: mealsLoading || profileLoading,
    error: combinedError, // перехватывает ЛЮБУЮ ошибку загрузки страницы

    // Методы управления
    refetch: handleRefetchAll, // Оживляем кнопку переотправки в AsyncBoundary
    deleteMeal,
    removeItem,
  };
}
