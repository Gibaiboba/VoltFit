import { useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toISODate } from "@/lib/utils/date-utils";
import {
  sortMeals,
  calculateTotalStats,
  calculateProgress,
} from "@/lib/utils/meal-utils";

export function useDiaryLogic(selectedDate: string | null) {
  // Загружаем данные из существующих хуков
  const {
    meals,
    isLoading: mealsLoading,
    error,
    refetch,
    deleteMeal,
    removeItem,
  } = useMealHistory();

  const { data: profile, isLoading: profileLoading } = useUserProfile();

  // 1. Формируем цели на основе профиля
  const goals = useMemo(
    () => ({
      kcal: profile?.daily_calories || 2000,
      p: profile?.protein || 0,
      f: profile?.fat || 0,
      c: profile?.carbs || 0,
    }),
    [profile],
  );

  // 2. Основная обработка данных для конкретной даты
  const diaryData = useMemo(() => {
    const targetDate = selectedDate || toISODate(new Date());

    // Фильтруем приемы пищи за нужный день
    // Используем startsWith для безопасности ISO строк
    const dayMeals = meals.filter((m) => m.created_at.startsWith(targetDate));

    // Используем наши утилиты для расчетов
    const consumed = calculateTotalStats(dayMeals);
    const progress = calculateProgress(consumed.kcal, goals.kcal);

    return {
      consumed,
      progress,
      displayMeals: sortMeals(dayMeals), // Сортируем через утилиту
    };
  }, [meals, selectedDate, goals]);

  return {
    ...diaryData,
    goals,
    allMeals: meals, // Пригодится для группировки в истории
    isLoading: mealsLoading || profileLoading,
    error,
    refetch,
    deleteMeal,
    removeItem,
  };
}
