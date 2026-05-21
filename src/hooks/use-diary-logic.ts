// hooks/use-diary-logic.ts
import { useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { sortMeals } from "@/lib/utils/meal-utils";
import { useNutritionStats } from "./use-nutrition-stats";
import { getErrorMessage } from "@/lib/utils/error-helper";
import { toISODate } from "@/lib/utils/date-utils";

export function useDiaryLogic(selectedDate: string, serverToday: string) {
  // УМНОЕ КВАНТОВАНИЕ: Округляем архивный хвост до начала месяца для стабильности кэша
  const fromDateDynamic = useMemo(() => {
    const today = new Date(serverToday);
    const selected = new Date(selectedDate);

    // Базовый порог: 30 дней назад от сегодняшнего дня
    today.setDate(today.getDate() - 30);

    // Если пользователь кликнул на дату глубже, чем 30 дней назад
    if (selected < today) {
      // Вырезаем год и месяц (из "2026-03-15" получаем "2026-03")
      const yearMonth = selectedDate.slice(0, 7);
      // Возвращаем строго первый день этого месяца для фиксации queryKey
      return `${yearMonth}-01`;
    }

    // Если кликаем внутри последнего месяца — дата старта неподвижна
    return toISODate(today);
  }, [serverToday, selectedDate]);

  // 1. Загружаем данные еды (теперь queryKey стабилен внутри любого архивного месяца)
  const {
    meals,
    isLoading: mealsLoading,
    isFetching: mealsFetching,
    error: mealsError,
    refetch: refetchMeals,
    deleteMeal,
    removeItem,
  } = useMealHistory(undefined, fromDateDynamic);

  // 2. Загружаем данные профиля
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

  // 4. Используем общий хук для расчетов БЖУ и калорий за выбранный день
  const { dayMeals, progress, roundedStats } = useNutritionStats(
    meals,
    selectedDate,
    goals.kcal,
  );

  // Функция для одновременного перезапуска запросов в AsyncBoundary
  const handleRefetchAll = async (): Promise<void> => {
    await Promise.all([refetchMeals(), refetchProfile()]);
  };

  // Комбинируем и приоритизируем ошибки
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

    // Статусы загрузки (разделяем первичную и фоновую дозагрузку)
    isLoading: mealsLoading || profileLoading,
    isFetching: mealsFetching,
    error: combinedError,

    // Методы управления
    refetch: handleRefetchAll,
    deleteMeal,
    removeItem,
  };
}
