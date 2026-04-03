"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { OnboardingData, Goal, ActivityLevel } from "../types/onboarding";

interface OnboardingState {
  step: number;
  data: Partial<OnboardingData>;
  currentInsight: string | null;

  setStep: (step: number) => void;
  setGoal: (goal: Goal) => void;
  setActivity: (level: ActivityLevel) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  setCurrentInsight: (insight: string | null) => void;
  reset: () => void;
}

// 1. Вспомогательная функция для БЖУ по твоим пропорциям
const calculateMacros = (data: Partial<OnboardingData>, calories: number) => {
  const weight = Number(data.weight) || 0;
  const { gender, goal } = data;

  if (!weight || calories <= 0) return { protein: 0, fat: 0, carbs: 0 };

  let p_rate = 1.5;
  let f_rate = 1.0;

  if (gender === "male") {
    if (goal === "lose_weight") {
      p_rate = 2.0;
      f_rate = 0.75;
    } else if (goal === "gain_muscle") {
      p_rate = 1.7;
      f_rate = 0.9;
    } else {
      p_rate = 1.6;
      f_rate = 1.0;
    } // maintain
  } else {
    if (goal === "lose_weight") {
      p_rate = 1.7;
      f_rate = 0.9;
    } else if (goal === "gain_muscle") {
      p_rate = 1.5;
      f_rate = 1.0;
    } else {
      p_rate = 1.3;
      f_rate = 1.1;
    } // maintain
  }

  const protein = Math.round(weight * p_rate);
  const fat = Math.round(weight * f_rate);
  // Углеводы — остаток калорий
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { protein, fat, carbs };
};

const calculateDailyCalories = (data: Partial<OnboardingData>): number => {
  const {
    weight,
    height,
    age,
    gender,
    activityLevel,
    goal,
    bodyType,
    massQuality,
  } = data;

  if (!weight || !height || !age || !gender || !activityLevel) return 0;

  let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
  bmr = gender === "male" ? bmr + 5 : bmr - 161;

  let total = Math.round(bmr * Number(activityLevel));

  if (goal === "lose_weight") total -= 500;
  if (goal === "gain_muscle") {
    let surplus = 300;
    if (bodyType === "ectomorph") surplus += 200;
    if (massQuality === "fast") surplus += 200;
    total += surplus;
  }

  return total;
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
        const calories = calculateDailyCalories(updatedData);
        const macros = calculateMacros(updatedData, calories); // Расчет БЖУ

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
        const calories = calculateDailyCalories(updatedData);
        const macros = calculateMacros(updatedData, calories); // Расчет БЖУ

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
