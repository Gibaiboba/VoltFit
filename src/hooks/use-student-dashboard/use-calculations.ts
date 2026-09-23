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
import { calculateDynamicWaterTarget } from "@/lib/utils/waterCalculator";
import {
  getAgeFromBirthDate,
  calculateDailyCalories,
} from "@/lib/fitnessCalculators";
import { Goal } from "@/types/onboarding";

export const useDashboardCalculations = (
  history: DailyLog[],
  profile: UserProfile | null,
  meals: SavedMeal[],
  selectedDate: string,
  userInput: Partial<FormDataType>,
  serverToday: string,
): DashboardCalculationsResult => {
  const baseTargetCalories = useMemo(() => {
    if (!profile) return 2000;

    const age = getAgeFromBirthDate(profile.birth_date);
    const currentAge = age > 0 ? age : 25;

    const stableWeight = profile.weight || 70;

    const normalizeGoal = (g: string | undefined): Goal => {
      if (g === "lose" || g === "lose_weight") return "lose_weight";
      if (g === "gain" || g === "gain_muscle") return "gain_muscle";
      return "maintain";
    };

    const calculation = calculateDailyCalories({
      weight: stableWeight,
      height: profile.height || 170,
      age: currentAge,
      gender: (profile.gender as "male" | "female") || "female",
      activityLevel: parseFloat(profile.activity_level?.toString() || "1.2"),
      goal: normalizeGoal(profile.goal),
      targetWeight: profile.target_weight,
      targetDate: profile.onboarding_metadata?.target_date,
    });

    return calculation.calories || 2000;
  }, [profile]);

  const currentLog = useMemo(
    () => history.find((l) => l.log_date === selectedDate),
    [history, selectedDate],
  );

  const currentActivities = useMemo<LoggedActivity[]>(() => {
    return userInput.activities ?? currentLog?.activities ?? [];
  }, [userInput.activities, currentLog?.activities]);

  const totalBurnedCalories = useMemo<number>(() => {
    if (!currentActivities || currentActivities.length === 0) return 0;
    return currentActivities.reduce(
      (sum, act) => sum + (Number(act.burned_calories) || 0),
      0,
    );
  }, [currentActivities]);

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

  const waterTarget = useMemo<number>(() => {
    const stepsCountLocal = parseInt(formData.steps) || 0;
    return calculateDynamicWaterTarget(
      profile,
      stepsCountLocal,
      currentActivities,
    );
  }, [profile, formData.steps, currentActivities]);

  return {
    currentLog,
    previousWeight,
    formData,
    waterTarget,
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
