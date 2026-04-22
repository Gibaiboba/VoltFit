"use client";

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
  // 1. Текущий лог из истории
  const currentLog = useMemo(
    () => history.find((l) => l.log_date === selectedDate),
    [history, selectedDate],
  );

  // 2. Расчет БЖУ и Калорий из реальных приемов пищи (Meals)
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

  // 3. Исправленный поиск предыдущего веса (точный и надежный)
  const previousWeight = useMemo(() => {
    const prevLogs = history
      .filter((l) => l.log_date < selectedDate && l.weight != null)
      .sort((a, b) => b.log_date.localeCompare(a.log_date));

    return prevLogs[0]?.weight ? prevLogs[0].weight.toString() : "--";
  }, [history, selectedDate]);

  // 4. Формирование данных для формы (Приоритет: ввод юзера > база > дефолт)
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

  // 5. Данные для графиков (последние 7 дней истории)
  const chartData = useMemo(() => {
    const sorted = [...history]
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .slice(-7);

    return {
      steps: sorted.map((l) => ({ x: l.log_date, y: l.steps || 0 })),
      calories: sorted.map((l) => ({ x: l.log_date, y: l.calories || 0 })),
    };
  }, [history]);

  // 6. Итоговые показатели и прогресс (Мемоизировано для стабильности ссылок)
  const targetCalories = useMemo(() => profile?.daily_calories || 0, [profile]);

  const currentCalories = useMemo(() => {
    return consumedFromHistory.kcal > 0
      ? Math.round(consumedFromHistory.kcal)
      : parseInt(formData.calories) || 0;
  }, [consumedFromHistory.kcal, formData.calories]);

  const calProgress = useMemo(() => {
    return targetCalories > 0 ? (currentCalories / targetCalories) * 100 : 0;
  }, [currentCalories, targetCalories]);

  const isToday = useMemo(
    () => selectedDate === serverToday,
    [selectedDate, serverToday],
  );

  const hasLog = useMemo(() => !!currentLog, [currentLog]);

  return {
    currentLog,
    consumedFromHistory,
    previousWeight,
    formData,
    currentProteins: Math.round(consumedFromHistory.p || 0),
    currentFats: Math.round(consumedFromHistory.f || 0),
    currentCarbs: Math.round(consumedFromHistory.c || 0),
    chartData,
    targetCalories,
    currentCalories,
    calProgress,
    isToday,
    hasLog,
  };
};
