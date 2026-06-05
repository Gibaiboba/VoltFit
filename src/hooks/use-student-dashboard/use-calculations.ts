import { useMemo } from "react";
import {
  FormDataType,
  LoggedActivity,
  DashboardCalculationsResult,
} from "./types";
import { DailyLog } from "@/types/shared";
import { SavedMeal } from "@/types/food";
import { UserProfile } from "@/types/user";
import { useNutritionStats } from "../use-nutrition-stats";
import { getPreviousWeight } from "@/lib/utils/weight-utils";
import { ACTIVITIES_MAP } from "@/constants/activities";

export const useDashboardCalculations = (
  history: DailyLog[],
  profile: UserProfile | null,
  meals: SavedMeal[],
  selectedDate: string,
  userInput: Partial<FormDataType>,
  serverToday: string,
): DashboardCalculationsResult => {
  const baseTargetCalories = useMemo(
    () => profile?.daily_calories || 2000,
    [profile],
  );

  const currentLog = useMemo(
    () => history.find((l) => l.log_date === selectedDate),
    [history, selectedDate],
  );

  // 1. Собираем актуальный массив активностей за день (Локальный черновик > База данных)
  const currentActivities = useMemo<LoggedActivity[]>(() => {
    return userInput.activities ?? currentLog?.activities ?? [];
  }, [userInput.activities, currentLog?.activities]);

  // 2. Суммируем калории всех тренировок за день
  const totalBurnedCalories = useMemo<number>(() => {
    if (!currentActivities || currentActivities.length === 0) return 0;

    const weight = profile?.weight || 70;
    const gender = profile?.gender || "female";
    const genderFactor = gender === "female" ? 0.014 : 0.015;

    return currentActivities.reduce((sum, act) => {
      const config = ACTIVITIES_MAP[act.activity_id];
      if (!config || act.duration <= 0) return sum;

      const kcal = Math.round(
        config.met * genderFactor * weight * act.duration,
      );
      return sum + kcal;
    }, 0);
  }, [currentActivities, profile]);

  const targetCalories = useMemo<number>(() => {
    return baseTargetCalories + totalBurnedCalories;
  }, [baseTargetCalories, totalBurnedCalories]);

  const { roundedStats, targetMacros } = useNutritionStats(
    meals,
    selectedDate,
    targetCalories,
    baseTargetCalories,
  );

  const previousWeight = useMemo<string>(() => {
    return getPreviousWeight(history, selectedDate);
  }, [history, selectedDate]);

  // 3. Конструируем стейт формы под поддержку массива активностей
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
      calories: (currentLog?.calories ?? "0").toString(),
      activities: currentActivities,
    };
  }, [userInput, currentLog, currentActivities]);

  const currentCalories = useMemo<number>(() => {
    const kcal =
      roundedStats.kcal > 0
        ? roundedStats.kcal
        : parseInt(formData.calories) || 0;
    return Math.round(kcal);
  }, [roundedStats.kcal, formData.calories]);

  const calProgress = useMemo<number>(() => {
    if (!targetCalories || targetCalories <= 0) return 0;
    return Math.min((currentCalories / targetCalories) * 100, 100);
  }, [currentCalories, targetCalories]);

  const chartData = useMemo(() => {
    const sorted = [...history]
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .slice(-7);
    return {
      steps: sorted.map((l) => ({ x: l.log_date, y: l.steps || 0 })),
      calories: sorted.map((l) => ({ x: l.log_date, y: l.calories || 0 })),
    };
  }, [history]);

  return {
    currentLog,
    previousWeight,
    formData,
    currentProteins: roundedStats.p,
    currentFats: roundedStats.f,
    currentCarbs: roundedStats.c,
    burnedCalories: totalBurnedCalories,
    chartData,
    targetCalories,
    currentCalories,
    calProgress,
    isToday: selectedDate === serverToday,
    hasLog: !!currentLog,
    targetProteins: targetMacros.p,
    targetFats: targetMacros.f,
    targetCarbs: targetMacros.c,
  };
};
