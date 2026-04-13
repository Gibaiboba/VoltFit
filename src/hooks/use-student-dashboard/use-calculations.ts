import { useMemo } from "react";
import { Log, FormDataType } from "./types";
import { SavedMeal } from "@/types/food";
import { toISODate } from "@/lib/utils/date-utils";
import { UserProfile } from "@/types/user";

export const useDashboardCalculations = (
  history: Log[],
  profile: UserProfile | null,
  meals: SavedMeal[],
  selectedDate: string,
  userInput: Record<string, string | number>,
  serverToday: string,
) => {
  // 1. Находим текущую запись
  const currentLog = useMemo(
    () => history.find((l) => l.log_date === selectedDate),
    [history, selectedDate],
  );

  // 2. Расчет съеденного из истории питания (Meals)
  const consumedFromHistory = useMemo(() => {
    const dayMeals = meals.filter(
      (m) => toISODate(new Date(m.created_at)) === selectedDate,
    );
    return dayMeals.reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.total_kcal || 0),
        p: acc.p + (m.total_p || 0),
        f: acc.f + (m.total_f || 0),
        c: acc.c + (m.total_c || 0),
      }),
      { kcal: 0, p: 0, f: 0, c: 0 },
    );
  }, [meals, selectedDate]);

  // 3. Расчет предыдущего веса
  const previousWeight = useMemo(() => {
    const prevLog = history.find((l) => l.log_date < selectedDate && l.weight);
    return prevLog?.weight ? prevLog.weight.toString() : "--";
  }, [history, selectedDate]);

  // 4. Формирование данных для формы (formData)
  const formData = useMemo<FormDataType>(() => {
    return {
      steps: (userInput.steps ?? currentLog?.steps ?? "").toString(),
      weight: (userInput.weight ?? currentLog?.weight ?? "").toString(),
      sleep_hours: (
        userInput.sleep_hours ??
        currentLog?.sleep_hours ??
        ""
      ).toString(),
      water: Number(userInput.water ?? currentLog?.water ?? 0),
      activity_level: (
        userInput.activity_level ??
        currentLog?.activity_level ??
        "День без тренировок"
      ).toString(),
      calories: (currentLog?.calories ?? "0").toString(),
    };
  }, [userInput, currentLog]);

  // 5. Расчет графиков (последние 7 записей)
  const chartData = useMemo(() => {
    const sorted = [...history]
      .sort(
        (a, b) =>
          new Date(a.log_date).getTime() - new Date(b.log_date).getTime(),
      )
      .slice(-7);

    return {
      steps: sorted.map((l) => ({ x: l.log_date, y: l.steps || 0 })),
      calories: sorted.map((l) => ({ x: l.log_date, y: l.calories || 0 })),
    };
  }, [history]);

  // 6. Итоговые калории и прогресс
  const targetCalories = profile?.daily_calories || 0;
  const currentCalories =
    consumedFromHistory.kcal > 0
      ? Math.round(consumedFromHistory.kcal)
      : parseInt(formData.calories) || 0;

  const calProgress =
    targetCalories > 0 ? (currentCalories / targetCalories) * 100 : 0;

  return {
    currentLog,
    consumedFromHistory,
    previousWeight,
    formData,
    chartData,
    targetCalories,
    currentCalories,
    calProgress,
    isToday: selectedDate === serverToday,
    hasLog: !!currentLog,
  };
};
