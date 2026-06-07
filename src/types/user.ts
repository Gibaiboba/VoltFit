import { Goal } from "./shared";

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
  avatar_url?: string | null;
  role: "student" | "coach";
  gender: "male" | "female" | null | string;
  email?: string;
  weight: number | null;
  height?: number;
  age?: number;
  goal?: Goal;
  target_weight?: number;

  daily_calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  onboarding_completed?: boolean;
  onboarding_metadata?: OnboardingMetadata | null;
  chest?: number;
  waist?: number;
  hips?: number;
  steps_goal?: number; // пока нет в таблице на supabase
}
