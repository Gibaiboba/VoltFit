"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { OnboardingData, Goal, ActivityLevel } from "../types/onboarding";
import {
  getAgeFromBirthDate,
  calculateDailyCalories,
  calculateMacros,
} from "@/lib/fitnessCalculators";

interface OnboardingState {
  step: number;
  data: Partial<OnboardingData> & { birth_date?: string };
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

// Вспомогательный хелпер для запуска сквозного пересчета КБЖУ внутри Zustand
const runCalculations = (
  updatedData: Partial<OnboardingData> & { birth_date?: string },
) => {
  // Вычисляем возраст из даты рождения, если она есть, иначе страхуемся полем age
  const age = updatedData.birth_date
    ? getAgeFromBirthDate(updatedData.birth_date)
    : Number(updatedData.age || 0);

  const calories = calculateDailyCalories({
    weight: Number(updatedData.weight || 0),
    height: Number(updatedData.height || 0),
    age: age,
    gender: updatedData.gender || "female",
    activityLevel: Number(updatedData.activityLevel || 0),
    goal: updatedData.goal || "maintain",
    bodyType: updatedData.bodyType,
    massQuality: updatedData.massQuality,
  });

  const macros = calculateMacros({
    weight: Number(updatedData.weight || 0),
    gender: updatedData.gender || "female",
    goal: updatedData.goal || "maintain",
    calories: calories,
  });

  return { calories, macros };
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
        const { calories, macros } = runCalculations(updatedData);

        set({
          data: {
            ...updatedData,
            daily_calories: calories,
            protein: macros.protein,
            fat: macros.fat,
            carbs: macros.carbs,
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
        const { calories, macros } = runCalculations(updatedData);

        set({
          data: {
            ...updatedData,
            daily_calories:
              calories > 0 ? calories : currentData.daily_calories,
            protein: macros.protein > 0 ? macros.protein : currentData.protein,
            fat: macros.fat > 0 ? macros.fat : currentData.fat,
            carbs: macros.carbs > 0 ? macros.carbs : currentData.carbs,
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
