"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { OnboardingData, Goal, ActivityLevel } from "../types/onboarding";
import {
  getAgeFromBirthDate,
  calculateDailyCalories,
  calculateMacros,
  calculateBaseWaterTarget,
  calculateBaseStepsTarget,
} from "@/lib/fitnessCalculators";

interface OnboardingState {
  step: number;
  data: Partial<OnboardingData> & {
    birth_date?: string;
    water_target?: number;
    steps_target?: number;
  };
  currentInsight: string | null;

  setStep: (step: number) => void;
  setGoal: (goal: Goal) => void;
  setActivity: (level: ActivityLevel) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (
    newData: Partial<OnboardingData> & { birth_date?: string },
  ) => void;
  setCurrentInsight: (insight: string | null) => void;
  reset: () => void;
}

// Вспомогательный хелпер для запуска сквозного пересчета КБЖУ, Воды и Шагов
const runCalculations = (
  updatedData: Partial<OnboardingData> & {
    birth_date?: string;
    target_date?: string;
    target_weight?: number;
  },
) => {
  const age = updatedData.birth_date
    ? getAgeFromBirthDate(updatedData.birth_date)
    : Number(updatedData.age || 0);

  const gender = updatedData.gender || "female";
  const activityLevel = Number(
    updatedData.activityLevel || 1.2,
  ) as ActivityLevel;
  const goal = updatedData.goal || "maintain";
  const weight = Number(updatedData.weight || 0);

  // 1. Расчет КБЖУ с учетом дедлайнов
  const { calories, adjustedDate, feedbackMessage } = calculateDailyCalories({
    weight,
    height: Number(updatedData.height || 0),
    age,
    gender,
    activityLevel,
    goal,
    bodyType: updatedData.bodyType,
    massQuality: updatedData.massQuality,
    targetWeight: updatedData.target_weight, // передаем
    targetDate: updatedData.target_date, // передаем
  });

  const macros = calculateMacros({
    weight,
    gender,
    goal,
    calories,
  });

  // 2. Расчет ВОДЫ
  const baseWaterLiters = calculateBaseWaterTarget({
    weight: weight || 70,
    gender,
    age: age || 25,
    activityLevel,
  });
  const waterTarget = Math.round(baseWaterLiters * 1000);

  // 3. Расчет ШАГОВ
  const stepsTarget = calculateBaseStepsTarget({
    goal,
    activityLevel,
  });

  return {
    calories,
    macros,
    waterTarget,
    stepsTarget,
    adjustedDate,
    feedbackMessage,
  };
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      step: 1,
      data: {},
      currentInsight: null,

      setStep: (step) => set({ step }),

      setGoal: (goal) => {
        const updatedData = { ...get().data, goal };
        set({ data: updatedData, step: get().step + 1 });
      },

      setActivity: (activityLevel) => {
        const updatedData = { ...get().data, activityLevel };
        const { calories, macros, waterTarget, stepsTarget, adjustedDate } =
          runCalculations(updatedData);

        set({
          data: {
            ...updatedData,
            daily_calories: calories,
            protein: macros.protein,
            fat: macros.fat,
            carbs: macros.carbs,
            water_target: waterTarget,
            steps_target: stepsTarget,
            target_date: adjustedDate || updatedData.target_date,
          },
        });
      },

      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      setCurrentInsight: (insight) => set({ currentInsight: insight }),

      updateData: (newData) => {
        const currentData = get().data;
        const updatedData = { ...currentData, ...newData };
        const { calories, macros, waterTarget, stepsTarget } =
          runCalculations(updatedData);

        set({
          data: {
            ...updatedData,
            daily_calories:
              calories > 0 ? calories : currentData.daily_calories,
            protein: macros.protein > 0 ? macros.protein : currentData.protein,
            fat: macros.fat > 0 ? macros.fat : currentData.fat,
            carbs: macros.carbs > 0 ? macros.carbs : currentData.carbs,
            water_target:
              waterTarget > 0 ? waterTarget : currentData.water_target,
            steps_target:
              stepsTarget > 0 ? stepsTarget : currentData.steps_target,
          },
        });
      },

      reset: () => {
        set({ step: 1, data: {}, currentInsight: null });
        localStorage.removeItem("onboarding-storage");
      },
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
