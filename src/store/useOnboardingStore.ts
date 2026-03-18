import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 1. Описываем типы данных для нашего опроса
export type Goal = "lose_weight" | "gain_muscle" | "maintain";
export type Gender = "male" | "female" | "other";
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725;

interface OnboardingData {
  goal: Goal;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  target_weight: number;
  activityLevel: ActivityLevel;
  vibe: string;
  daily_calories?: number;
}

interface OnboardingState {
  step: number;
  data: Partial<OnboardingData>;

  // Методы управления
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  reset: () => void;
}

// 2. Функция расчета нормы калорий (BMR * Activity)
const calculateDailyCalories = (data: Partial<OnboardingData>): number => {
  const { weight, height, age, gender, activityLevel, goal } = data;

  if (!weight || !height || !age || !gender || !activityLevel) return 0;

  // Базовый метаболизм (BMR) по формуле Миффлина-Сан Жеора
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === "male" ? bmr + 5 : bmr - 161;

  // Умножаем на коэффициент активности
  let totalCalories = Math.round(bmr * activityLevel);

  // Корректировка под цель
  if (goal === "lose_weight") totalCalories -= 500; // Дефицит
  if (goal === "gain_muscle") totalCalories += 300; // Профицит

  return totalCalories;
};

// 3. Создание стора с persist (чтобы данные не пропадали при обновлении страницы)
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      step: 1,
      data: {},

      setStep: (step) => set({ step }),

      nextStep: () => set((state) => ({ step: state.step + 1 })),

      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),

      updateData: (newData) => {
        const updatedData = { ...get().data, ...newData };

        // Автоматически пересчитываем калории при каждом обновлении данных
        const calories = calculateDailyCalories(updatedData);

        set({
          data: {
            ...updatedData,
            daily_calories: calories > 0 ? calories : undefined,
          },
        });
      },

      reset: () => set({ step: 1, data: {} }),
    }),
    {
      name: "onboarding-storage", // Ключ в LocalStorage
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
