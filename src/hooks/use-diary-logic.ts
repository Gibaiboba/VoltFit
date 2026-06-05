import { useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { sortMeals } from "@/lib/utils/meal-utils";
import { useNutritionStats } from "./use-nutrition-stats";
import { getErrorMessage } from "@/lib/utils/error-helper";
import { toISODate } from "@/lib/utils/date-utils";
// 🟢 ИМПОРТИРУЕМ ХУК ЗАПРОСОВ ЛОГОВ (тот же, что и на главной)
import { useDashboardQueries } from "@/hooks/use-student-dashboard/use-queries";

export function useDiaryLogic(selectedDate: string, serverToday: string) {
  // УМНОЕ КВАНТОВАНИЕ: Округляем архивный хвост до начала месяца для стабильности кэша
  const fromDateDynamic = useMemo(() => {
    const today = new Date(serverToday);
    const selected = new Date(selectedDate);

    // Базовый порог: 30 дней назад от сегодняшнего дня
    today.setDate(today.getDate() - 30);

    // Если пользователь кликнул на дату глубже, чем 30 дней назад
    if (selected < today) {
      const yearMonth = selectedDate.slice(0, 7);
      return `${yearMonth}-01`;
    }

    return toISODate(today);
  }, [serverToday, selectedDate]);

  // 1. Загружаем данные еды
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

  // 🟢 3. Загружаем логи активности пользователя за этот же период
  // (Предполагается, что в профиле лежит userId. Если в useUserProfile лежит id, берем его)
  const userId = profile?.id || "";
  const { history, logsQuery } = useDashboardQueries(
    userId,
    serverToday,
    selectedDate,
  );

  // 🟢 4. Вычисляем сожженные калории за выбранный день
  const burnedCalories = useMemo(() => {
    const currentLog = history.find((l) => l.log_date === selectedDate);
    return currentLog?.burned_calories || 0;
  }, [history, selectedDate]);

  // Базовые целевые калории
  const baseTargetCalories = useMemo(
    () => profile?.daily_calories || 2000,
    [profile],
  );

  // Динамическая цель калорий (база + спорт)
  const targetCalories = useMemo(() => {
    return baseTargetCalories + burnedCalories;
  }, [baseTargetCalories, burnedCalories]);

  // 🟢 5. Используем общий хук для расчетов БЖУ и калорий с передачей динамической цели
  const { dayMeals, progress, roundedStats, targetMacros } = useNutritionStats(
    meals,
    selectedDate,
    targetCalories, // Новая динамическая цель
    baseTargetCalories, // Базовая цель для расчета дельты внутри хука
  );

  // Динамические цели для вывода наружу
  const goals = useMemo(
    () => ({
      kcal: targetCalories,
      p: targetMacros.p,
      f: targetMacros.f,
      c: targetMacros.c,
    }),
    [targetCalories, targetMacros],
  );

  // ОПТИМИЗАЦИЯ: Мемоизируем сортировку и трансформируем массив в объект-карту.
  const displayMealsMap = useMemo(() => {
    const sorted = sortMeals(dayMeals);

    const map: Record<string, (typeof dayMeals)[number]> = {};
    for (const meal of sorted) {
      let slotKey = meal.meal_type;

      if (!slotKey && meal.meal_name) {
        const nameLower = meal.meal_name.toLowerCase();

        if (nameLower.includes("завтр")) slotKey = "breakfast";
        else if (nameLower.includes("обед")) slotKey = "lunch";
        else if (nameLower.includes("ужин")) slotKey = "dinner";
        else if (nameLower.includes("пер") || nameLower.includes("снак"))
          slotKey = "snack";
      }

      const finalKey = slotKey || "snack";
      map[finalKey] = meal;
    }
    return map;
  }, [dayMeals]);

  // Функция для одновременного перезапуска запросов в AsyncBoundary
  const handleRefetchAll = async (): Promise<void> => {
    await Promise.all([refetchMeals(), refetchProfile(), logsQuery.refetch()]);
  };

  // Комбинируем и приоритизируем ошибки
  const combinedError = useMemo(() => {
    const activeError = mealsError || profileError || logsQuery.error;
    return activeError ? getErrorMessage(activeError as Error) : null;
  }, [mealsError, profileError, logsQuery.error]);

  return {
    displayMeals: displayMealsMap,
    allMeals: meals,
    consumed: roundedStats,
    goals, // Теперь тут лежат динамически повышенные БЖУ и ккал!
    progress,

    isLoading:
      mealsLoading ||
      profileLoading ||
      (logsQuery.isLoading && history.length === 0),
    isFetching: mealsFetching || logsQuery.isFetching,
    error: combinedError,

    refetch: handleRefetchAll,
    deleteMeal,
    removeItem,
  };
}
