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
  created_at?: string;

  selected_activity_id: string | null;
  activity_duration: number;
  activity_name?: string;
  burned_calories: number;
}

export interface FormDataType {
  steps: string;
  weight: string;
  sleep_hours: string;
  water: number;

  calories: string;
  selected_activity_id: string;
  activity_duration: string;
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
    history: Log[];
    todayStr: string;
    profile: UserProfile | null;
    isSaving: boolean;
    error: string | null;
    burnedCalories: number;
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
