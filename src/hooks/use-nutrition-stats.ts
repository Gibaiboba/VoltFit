import { useMemo } from "react";
import { toISODate } from "@/lib/utils/date-utils";
import { calculateTotalStats, calculateProgress } from "@/lib/utils/meal-utils";
import { SavedMeal } from "@/types/food";

export function useNutritionStats(
  meals: SavedMeal[],
  selectedDate: string,
  targetKcal: number,
  baseKcal: number = 2000,
) {
  return useMemo(() => {
    const dayMeals = meals.filter((m) => {
      const mealDate = toISODate(new Date(m.created_at));
      return mealDate === selectedDate;
    });

    const consumed = calculateTotalStats(dayMeals);
    const progress = calculateProgress(consumed.kcal, targetKcal);
    const burnedCalories = Math.max(0, targetKcal - baseKcal);

    const baseP = Math.round((baseKcal * 0.3) / 4);
    const baseF = Math.round((baseKcal * 0.3) / 9);
    const baseC = Math.round((baseKcal * 0.4) / 4);

    const extraP = Math.round((burnedCalories * 0.2) / 4);
    const extraF = Math.round((burnedCalories * 0.1) / 9);
    const extraC = Math.round((burnedCalories * 0.7) / 4);

    const targetProteins = baseP + extraP || 0;
    const targetFats = baseF + extraF || 0;
    const targetCarbs = baseC + extraC || 0;

    return {
      dayMeals,
      consumed,
      progress,
      roundedStats: {
        kcal: Math.round(consumed.kcal) || 0,
        p: Math.round(consumed.p) || 0,
        f: Math.round(consumed.f) || 0,
        c: Math.round(consumed.c) || 0,
      },
      targetMacros: {
        p: targetProteins,
        f: targetFats,
        c: targetCarbs,
      },
      macrosProgress: {
        p:
          targetProteins > 0
            ? Math.min((consumed.p / targetProteins) * 100, 100)
            : 0,
        f: targetFats > 0 ? Math.min((consumed.f / targetFats) * 100, 100) : 0,
        c:
          targetCarbs > 0 ? Math.min((consumed.c / targetCarbs) * 100, 100) : 0,
      },
    };
  }, [meals, selectedDate, targetKcal, baseKcal]);
}
