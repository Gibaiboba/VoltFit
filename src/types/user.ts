import { Goal } from "./shared";
import { FitnessProfile } from "./workout";

// Только метаданные основного онбординга (дедлайн и триггеры из BASE_QUESTIONS / TARGET_QUESTIONS)
export interface OnboardingMetadata {
  target_date?: string;
  start_date?: string;
  start_weight?: number;
  main_enemy?: "sweets" | "fastfood" | "night_eating" | "stress" | string;
  fail_reason?: "strict" | "no_progress" | "boredom" | "first_time" | string;
  body_type?: "ectomorph" | "mesomorph" | "endomorph" | string;
  appetite?: "low" | "high" | string;
  energy_level?: "tired" | "slump" | "good" | string;
  main_concern?: "sugar" | "cramps" | "gums" | string;
}

// Структура для будущего 3-го онбординга (страница рецептов и питания)
export interface NutritionProfile {
  completed: boolean;
  answers: Record<string, string | string[]>;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
  role: "student" | "coach";
  gender: "male" | "female" | null | string;
  email?: string;
  weight: number | null;
  height?: number;
  age?: number;
  birth_date?: string;
  goal?: Goal;
  target_weight?: number;
  activity_level?: number;
  daily_calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  onboarding_completed?: boolean;
  onboarding_metadata?: OnboardingMetadata | null;
  fitness_profile?: FitnessProfile | null; // <--- 2-й онбординг (Тренировки)
  nutrition_profile?: NutritionProfile | null; // <--- 3-й онбординг (Питание)
  chest?: number;
  waist?: number;
  hips?: number;
  water_target?: number;
  steps_target: number;
  created_at: string;
}
