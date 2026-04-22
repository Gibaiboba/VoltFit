import { UserProfile } from "@/types/user";

export interface Log {
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
}

export interface FormDataType {
  steps: string;
  weight: string;
  sleep_hours: string;
  water: number;
  activity_level: string;
  calories: string;
}
export interface MutationContext {
  previousLogs?: Log[];
}

export type FormUpdater =
  | Partial<FormDataType>
  | ((prev: FormDataType) => Partial<FormDataType>);

export interface StudentDashboardHook {
  state: {
    loading: boolean;
    selectedDate: string;
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
    calProgress: number;
    history: Log[];
    consumedFromHistory: { kcal: number; p: number; f: number; c: number };
    todayStr: string;
    profile: UserProfile | null; // Ссылка на общий тип!
    isSaving: boolean;
    error: string | null;
  };
  actions: {
    handleDateChange: (date: string) => void;
    handleSave: () => void;
    setFormData: (updater: FormUpdater) => void;
    addWater: () => void;
    removeWater: () => void;
  };
}
