"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Goal, ActivityLevel } from "../types/onboarding";
import {
  getAgeFromBirthDate,
  calculateDailyCalories,
  calculateMacros,
  calculateBaseWaterTarget,
  calculateBaseStepsTarget,
} from "@/lib/fitnessCalculators";

// Чистые типы исключительно под данные тренера
export interface CoachOnboardingData {
  goal: Goal;
  coach_specialization: string;
  experience_years: string;
  is_diary_public: "public" | "private";
  gender: "male" | "female";
  birth_date: string;
  height: string;
  weight: string;
  target_weight: string;
  activityLevel: ActivityLevel;
  daily_calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  water_target?: number;
  steps_target?: number;
  coach_bio?: string;
  coach_motivation_style?: string;
}

interface CoachOnboardingState {
  step: number;
  data: Partial<CoachOnboardingData>;
  currentInsight: string | null;

  setStep: (step: number) => void;
  setGoal: (goal: Goal) => void;
  setActivity: (level: ActivityLevel) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (newData: Partial<CoachOnboardingData>) => void;
  setCurrentInsight: (insight: string | null) => void;
  reset: () => void;
}

// Автономный расчет для тренера (переиспользованы общие формулы)
const runCoachCalculations = (updatedData: Partial<CoachOnboardingData>) => {
  const age = updatedData.birth_date
    ? getAgeFromBirthDate(updatedData.birth_date)
    : 25;
  const gender = updatedData.gender || "female";
  const activityLevel = Number(
    updatedData.activityLevel || 1.2,
  ) as ActivityLevel;
  const goal = updatedData.goal || "maintain";
  const weight = Number(updatedData.weight || 0);

  // 1. КБЖУ
  const calories = calculateDailyCalories({
    weight,
    height: Number(updatedData.height || 0),
    age,
    gender,
    activityLevel,
    goal,
  });

  const macros = calculateMacros({
    weight,
    gender,
    goal,
    calories,
  });

  // 2. Вода в мл
  const baseWaterLiters = calculateBaseWaterTarget({
    weight: weight || 70,
    gender,
    age,
    activityLevel,
  });
  const waterTarget = Math.round(baseWaterLiters * 1000);

  // 3. Шаги
  const stepsTarget = calculateBaseStepsTarget({
    goal,
    activityLevel,
  });

  return { calories, macros, waterTarget, stepsTarget };
};

export const useCoachOnboardingStore = create<CoachOnboardingState>()(
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
        const { calories, macros, waterTarget, stepsTarget } =
          runCoachCalculations(updatedData);

        set({
          data: {
            ...updatedData,
            daily_calories: calories,
            protein: macros.protein,
            fat: macros.fat,
            carbs: macros.carbs,
            water_target: waterTarget,
            steps_target: stepsTarget,
          },
          step: get().step + 1,
        });
      },

      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      setCurrentInsight: (insight) => set({ currentInsight: insight }),

      updateData: (newData) => {
        const currentData = get().data;
        const updatedData = { ...currentData, ...newData };
        const { calories, macros, waterTarget, stepsTarget } =
          runCoachCalculations(updatedData);

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
        localStorage.removeItem("coach-onboarding-storage");
      },
    }),
    {
      name: "coach-onboarding-storage", // <-- Уникальный ключ в LocalStorage
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
