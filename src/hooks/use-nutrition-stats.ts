import { useMemo } from "react";
import { toISODate } from "@/lib/utils/date-utils";
import { calculateTotalStats, calculateProgress } from "@/lib/utils/meal-utils";
import { SavedMeal } from "@/types/food";

export function useNutritionStats(
  meals: SavedMeal[],
  selectedDate: string,
  targetKcal: number,
) {
  return useMemo(() => {
    // 1. Фильтруем еду строго по выбранной дате
    const dayMeals = meals.filter((m) => {
      const mealDate = toISODate(new Date(m.created_at));
      return mealDate === selectedDate;
    });

    // 2. Считаем сумму через твою утилиту
    const consumed = calculateTotalStats(dayMeals);

    // 3. Считаем прогресс
    const progress = calculateProgress(consumed.kcal, targetKcal);

    return {
      dayMeals,
      consumed,
      progress,
      // Возвращаем сразу округленные макросы для UI
      roundedStats: {
        kcal: Math.round(consumed.kcal),
        p: Math.round(consumed.p),
        f: Math.round(consumed.f),
        c: Math.round(consumed.c),
      },
    };
  }, [meals, selectedDate, targetKcal]);
}
