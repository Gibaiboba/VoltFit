import { Goal, ActivityLevel } from "./onboarding";

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

  // Физика (из колонок таблицы profiles)
  weight?: number;
  height?: number;
  age?: number;
  goal?: Goal;
  target_weight?: number;
  activity_level?: ActivityLevel;

  // КБЖУ (из колонок таблицы profiles)
  daily_calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;

  // Психология (из JSON колонки onboarding_metadata)
  onboarding_metadata?: OnboardingMetadata;

  onboarding_completed?: boolean;
  updated_at?: string;
}
