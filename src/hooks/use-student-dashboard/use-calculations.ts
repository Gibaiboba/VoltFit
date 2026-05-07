"use client";

import { useMemo } from "react";
import { Log, FormDataType } from "./types";
import { SavedMeal } from "@/types/food";
import { UserProfile } from "@/types/user";
import { calculateTotalStats, calculateProgress } from "@/lib/utils/meal-utils";

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

  // 2.  Расчет БЖУ через единую утилиту
  const consumedFromHistory = useMemo(() => {
    // Фильтруем по дате (быстрый способ через startsWith)
    const dayMeals = meals.filter((m) => m.created_at.startsWith(selectedDate));
    return calculateTotalStats(dayMeals);
  }, [meals, selectedDate]);

  // 3. Исправленный поиск предыдущего веса
  const previousWeight = useMemo(() => {
    const prevLogs = history
      .filter((l) => l.log_date < selectedDate && l.weight != null)
      .sort((a, b) => b.log_date.localeCompare(a.log_date));

    return prevLogs[0]?.weight ? prevLogs[0].weight.toString() : "--";
  }, [history, selectedDate]);

  // 4. Формирование данных для формы
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

  // 5. Данные для графиков
  const chartData = useMemo(() => {
    const sorted = [...history]
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .slice(-7);

    return {
      steps: sorted.map((l) => ({ x: l.log_date, y: l.steps || 0 })),
      calories: sorted.map((l) => ({ x: l.log_date, y: l.calories || 0 })),
    };
  }, [history]);

  // 6. Итоговые показатели и прогресс
  const targetCalories = useMemo(() => profile?.daily_calories || 0, [profile]);

  const currentCalories = useMemo(() => {
    // Если есть приемы пищи — берем их, если нет — берем ручной ввод из лога
    const kcal =
      consumedFromHistory.kcal > 0
        ? consumedFromHistory.kcal
        : parseInt(formData.calories) || 0;
    return Math.round(kcal);
  }, [consumedFromHistory.kcal, formData.calories]);

  const calProgress = useMemo(() => {
    // Используем единую утилиту прогресса
    return calculateProgress(currentCalories, targetCalories);
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
    currentProteins: Math.round(consumedFromHistory.p),
    currentFats: Math.round(consumedFromHistory.f),
    currentCarbs: Math.round(consumedFromHistory.c),
    chartData,
    targetCalories,
    currentCalories,
    calProgress,
    isToday,
    hasLog,
  };
};
