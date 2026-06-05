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
  burned_calories: number;
  activity_name?: string;
  activities: {
    id: string;
    activity_id: string;
    duration: number;
    burned_calories: number;
  }[];
}
