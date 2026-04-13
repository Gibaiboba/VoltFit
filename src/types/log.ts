export interface DailyLog {
  weight: number;
  steps: number;
  calories: number;
  sleep_hours: number;
  water: number;
  activity_level: string;
  log_date: string;
  id?: string;
  user_id?: string;
  created_at?: string;
}
