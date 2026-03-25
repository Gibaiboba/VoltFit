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

  // Если базовых данных нет, возвращаем 0
  if (!weight || !height || !age || !gender || !activityLevel) return 0;

  // Формула Миффлина-Сан Жеора
  let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
  bmr = gender === "male" ? bmr + 5 : bmr - 161;

  let total = Math.round(bmr * Number(activityLevel));

  // Корректировка целей
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
        const currentData = get().data;
        const updatedData = { ...currentData, goal };
        set({
          data: updatedData,
          step: get().step + 1,
        });
      },

      setActivity: (activityLevel) => {
        const updatedData = { ...get().data, activityLevel };
        const calories = calculateDailyCalories(updatedData);
        set({
          data: { ...updatedData, daily_calories: calories },
          step: get().step + 1,
        });
      },

      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      setCurrentInsight: (insight) => set({ currentInsight: insight }),

      updateData: (newData) => {
        const currentData = get().data;
        const updatedData = { ...currentData, ...newData };

        // Пересчитываем калории
        const calories = calculateDailyCalories(updatedData);

        set({
          data: {
            ...updatedData,
            daily_calories:
              calories > 0 ? calories : currentData.daily_calories,
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
