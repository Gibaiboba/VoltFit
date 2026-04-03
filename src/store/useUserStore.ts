import { create } from "zustand";
import { User } from "@supabase/supabase-js";

// 1. Описываем структуру дополнительных ответов
export interface OnboardingMetadata {
  diet_type?: "everything" | "vegan" | "keto" | "restrictions";
  main_enemy?: "sweets" | "fastfood" | "night_eating" | "stress";
  cooking_time?: "none" | "fast" | "slow";
  fail_reason?: "strict" | "no_progress" | "boredom";
  stress_level?: "low" | "high";
  training_mode?: "pro" | "disciplined" | "none";
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "coach";
  // Метрики из онбординга
  weight?: number;
  height?: number;
  age?: number;
  goal?: "lose_weight" | "gain_muscle" | "maintain";
  target_weight?: number;
  activity_level?: number;
  daily_calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  // Метаданные и статус
  onboarding_metadata?: OnboardingMetadata;
  onboarding_completed?: boolean;
  // Замеры
  chest?: number;
  waist?: number;
  hips?: number;
  updated_at?: string;
}

interface UserState {
  user: User | null;
  profile: UserProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, ...updates }
        : (updates as UserProfile),
    })),
  clearUser: () => set({ user: null, profile: null }),
}));
