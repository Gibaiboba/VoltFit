import { useMemo } from "react";
import { toISODate } from "@/lib/utils/date-utils";
import { calculateTotalStats, calculateProgress } from "@/lib/utils/meal-utils";
import { SavedMeal } from "@/types/food";

export function useNutritionStats(
  meals: SavedMeal[],
  selectedDate: string,
  targetKcal: number, // Сюда уже приходят базовые калории + калории от тренировки
  baseKcal: number = 2000, // Добавим базовый калораж для пропорции
) {
  return useMemo(() => {
    // 1. Фильтруем еду строго по выбранной дате
    const dayMeals = meals.filter((m) => {
      const mealDate = toISODate(new Date(m.created_at));
      return mealDate === selectedDate;
    });

    // 2. Считаем сумму съеденного через утилиту
    const consumed = calculateTotalStats(dayMeals);

    // 3. Считаем прогресс калорий
    const progress = calculateProgress(consumed.kcal, targetKcal);

    // 4. Вычисляем динамические цели БЖУ на основе финального targetKcal
    // Вычисляем дельту (сожженные калории)
    const burnedCalories = Math.max(0, targetKcal - baseKcal);

    // Базовые цели БЖУ (30% / 30% / 40% от базовых калорий профиля)
    const baseP = Math.round((baseKcal * 0.3) / 4);
    const baseF = Math.round((baseKcal * 0.3) / 9);
    const baseC = Math.round((baseKcal * 0.4) / 4);

    // Добавочные БЖУ от тренировки (20% белки, 10% жиры, 70% углеводы)
    const extraP = Math.round((burnedCalories * 0.2) / 4);
    const extraF = Math.round((burnedCalories * 0.1) / 9);
    const extraC = Math.round((burnedCalories * 0.7) / 4);

    const targetProteins = baseP + extraP;
    const targetFats = baseF + extraF;
    const targetCarbs = baseC + extraC;

    return {
      dayMeals,
      consumed,
      progress,
      // Возвращаем округленные съеденные БЖУ
      roundedStats: {
        kcal: Math.round(consumed.kcal),
        p: Math.round(consumed.p),
        f: Math.round(consumed.f),
        c: Math.round(consumed.c),
      },
      // Возвращаем динамические ЦЕЛИ БЖУ, адаптированные под тренировку
      targetMacros: {
        p: targetProteins,
        f: targetFats,
        c: targetCarbs,
      },
      // Сразу считаем процент выполнения по каждому макросу для UI полосок
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
