// hooks/use-diary-logic.ts
import { useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { sortMeals } from "@/lib/utils/meal-utils";
import { useNutritionStats } from "./use-nutrition-stats";
import { getErrorMessage } from "@/lib/utils/error-helper"; // Наш обработчик ошибок

export function useDiaryLogic(selectedDate: string) {
  // 1. Загружаем сырые данные из существующих хуков
  const {
    meals,
    isLoading: mealsLoading,
    error: mealsError, // Переименовали для удобства трансформации
    refetch,
    deleteMeal,
    removeItem,
  } = useMealHistory();

  const { data: profile, isLoading: profileLoading } = useUserProfile();

  // 2. Формируем цели на основе профиля
  const goals = useMemo(
    () => ({
      kcal: profile?.daily_calories || 2000,
      p: profile?.protein || 0,
      f: profile?.fat || 0,
      c: profile?.carbs || 0,
    }),
    [profile],
  );

  // 3. Используем общий хук для расчетов
  const { dayMeals, progress, roundedStats } = useNutritionStats(
    meals,
    selectedDate,
    goals.kcal,
  );

  return {
    // Данные для отображения
    displayMeals: sortMeals(dayMeals),
    allMeals: meals,
    consumed: roundedStats, // Округленные БЖУ (p, f, c, kcal)
    goals,
    progress,

    // Статусы
    isLoading: mealsLoading || profileLoading,
    // Трансформируем техническую ошибку в понятную строку на русском языке
    error: mealsError ? getErrorMessage(mealsError) : null,

    // Методы управления
    refetch,
    deleteMeal,
    removeItem,
  };
}
