export type Goal = "lose_weight" | "gain_muscle" | "maintain";

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
  created_at?: string;
  proteins?: number;
  fats?: number;
  carbs?: number;
  selected_activity_id: string | null;
  activity_duration: number;
  activity_name?: string;
  burned_calories: number;
}
