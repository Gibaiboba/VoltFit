import { UserProfile } from "@/types/user";
import { DailyLog } from "@/types/shared";

export interface LoggedActivity {
  id: string; // уникальный ID записи (crypto.randomUUID())
  activity_id: string; // Ключ из ACTIVITIES_MAP
  duration: number; // Минуты
  burned_calories: number; // Рассчитанные калории именно за эту сессию
}

export interface Log {
  id?: string;
  user_id?: string;
  log_date: string;
  weight: number;
  steps: number;
  calories: number;
  sleep_hours: number;
  water: number;
  created_at?: string;

  burned_calories: number;
  activities: LoggedActivity[];
}

export interface FormDataType {
  steps: string;
  weight: string;
  sleep_hours: string;
  water: number;
  calories: string;

  // 🟢 ИСПРАВЛЕНО: Форма теперь держит массив залогированных активностей за день
  activities: LoggedActivity[];
}

export type FormUpdater =
  | Partial<FormDataType>
  | ((prev: FormDataType) => Partial<FormDataType>);

export interface StudentDashboardHook {
  state: {
    loading: boolean;
    formData: FormDataType;
    previousWeight: string;
    isToday: boolean;
    hasLog: boolean;
    chartData: {
      steps: { x: string; y: number }[];
      calories: { x: string; y: number }[];
    };
    targetCalories: number;
    currentCalories: number;
    currentProteins: number;
    currentFats: number;
    currentCarbs: number;
    calProgress: number;
    history: DailyLog[]; // Поддержка обновленной структуры DailyLog
    todayStr: string;
    profile: UserProfile | null;
    isSaving: boolean;
    error: string | null;
    burnedCalories: number;
    targetProteins: number;
    targetFats: number;
    targetCarbs: number;
  };
  actions: {
    handleDateChange: (date: string) => void;
    handleSave: () => void;
    setFormData: (updater: FormUpdater) => void;
    addWater: () => void;
    removeWater: () => void;
    refetch: () => Promise<void>;
  };
}

export interface DashboardCalculationsResult {
  currentLog: DailyLog | undefined;
  previousWeight: string;
  formData: FormDataType;
  currentProteins: number;
  currentFats: number;
  currentCarbs: number;
  burnedCalories: number;
  chartData: {
    steps: { x: string; y: number }[];
    calories: { x: string; y: number }[];
  };
  targetCalories: number;
  waterTarget: number;
  currentCalories: number;
  calProgress: number;
  isToday: boolean;
  hasLog: boolean;
  targetProteins: number;
  targetFats: number;
  targetCarbs: number;
}
