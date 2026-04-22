export type Goal = "lose_weight" | "gain_muscle" | "maintain";
export type ActivityLevelValue = 1.2 | 1.375 | 1.55 | 1.725;

// Самый важный тип — Единый Лог между тренером и учеником
export interface DailyLog {
  id?: string;
  user_id?: string;
  log_date: string;
  weight: number;
  steps: number;
  calories: number;
  sleep_hours: number;
  water: number;
  activity_level: string;
  created_at?: string;
  proteins?: number;
  fats?: number;
  carbs?: number;
}
