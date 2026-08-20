"use client";
import { useMemo } from "react";
import { DailyLog } from "@/types/shared";
import { SavedMeal } from "@/types/food";

interface UseDayRowCalculationsProps {
  log?: DailyLog;
  meals: SavedMeal[];
  baseCalories: number;
  studentWeight: number; // Оставляем для совместимости пропсов, если нужно
  studentGender: string; // Оставляем для совместимости пропсов, если нужно
}

export function useDayRowCalculations({
  log,
  meals,
  baseCalories,
}: UseDayRowCalculationsProps) {
  // 1. Исправленный расчет съеденного: приоритет у приемов пищи, но если их нет — берем ручной ввод из лога
  const totalConsumedKcal = useMemo(() => {
    const mealsSum = meals.reduce((sum, m) => sum + (m.total_kcal || 0), 0);
    if (mealsSum > 0) return mealsSum;

    return Number(log?.calories) || 0;
  }, [meals, log?.calories]);

  // 2. ИСПРАВЛЕНИЕ ОШИБКИ: Суммируем готовые калории из базы данных без формул пересчета
  const totalBurnedCalories = useMemo(() => {
    const logActivities = log?.activities || [];
    if (logActivities.length === 0) return 0;

    // Складываем ровно те числа, которые выводятся на карточках активностей act.burned_calories
    return logActivities.reduce(
      (sum, act) => sum + (act.burned_calories || 0),
      0,
    );
  }, [log?.activities]);

  // 3. Динамический расчет итоговой цели на день (База + Траты на спорте)
  const dynamicTargetCalories = useMemo(() => {
    return baseCalories + totalBurnedCalories;
  }, [baseCalories, totalBurnedCalories]);

  return {
    totalConsumedKcal,
    totalBurnedCalories,
    dynamicTargetCalories,
  };
}
