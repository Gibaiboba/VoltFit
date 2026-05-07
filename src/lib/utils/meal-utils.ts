import { SavedMeal } from "@/types/food";

export const MEAL_ORDER = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snack: 4,
} as const;

/**
 * Сортирует приемы пищи по типу и времени создания
 */
export function sortMeals(meals: SavedMeal[]): SavedMeal[] {
  if (!meals.length) return [];

  return [...meals].sort((a, b) => {
    const typeA = (a.meal_type?.toLowerCase() || "") as keyof typeof MEAL_ORDER;
    const typeB = (b.meal_type?.toLowerCase() || "") as keyof typeof MEAL_ORDER;

    const orderA = MEAL_ORDER[typeA] ?? 99;
    const orderB = MEAL_ORDER[typeB] ?? 99;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();

    return timeA - timeB;
  });
}

/**
 Суммирует калории и БЖУ для списка приемов пищи
 */
export function calculateTotalStats(meals: SavedMeal[]) {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.total_kcal || 0),
      p: acc.p + (m.total_p || 0),
      f: acc.f + (m.total_f || 0),
      c: acc.c + (m.total_c || 0),
    }),
    { kcal: 0, p: 0, f: 0, c: 0 },
  );
}

/**
 Рассчитывает процент достижения цели (0-100)
 */
export function calculateProgress(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}
