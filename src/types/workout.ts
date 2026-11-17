// Данные одиночного подхода (сета) в упражнении
export interface WorkoutSet {
  reps: string;
  weight: string;
  done: boolean;
}

// Упражнение, содержащее массив подходов
export interface WorkoutExercise {
  id: string;
  title: string;
  met: number;
  sets: WorkoutSet[];
  video_url?: string;
  rest_time: number;
}

export type ExerciseLocation = "home" | "gym" | "street";
export type ExerciseEquipment =
  | "bodyweight"
  | "bands"
  | "dumbbells"
  | "pullup_bar"
  | "full_gym";
export type HealthRestriction =
  | "back"
  | "knees"
  | "heart"
  | "injuries"
  | "postpartum";

// Шаблон упражнения из статической базы данных (библиотеки)
export interface ExerciseTemplate {
  id: string;
  title: string;
  met: number;
  image: string;
  category:
    | "chest"
    | "back"
    | "legs"
    | "shoulders"
    | "arms"
    | "abs"
    | "cardio"
    | string;
  video_url?: string;
  target_muscle: string;
  locations?: ExerciseLocation[];
  equipment?: ExerciseEquipment[];
  contraindications?: HealthRestriction[];
}

// Модель сохраненного шаблона тренировки
export interface WorkoutTemplate {
  id?: string;
  name: string;
  exercises: WorkoutExercise[];
}

// Пропсы для конструктора шаблонов (CustomWorkoutBuilder)
export interface CustomWorkoutBuilderProps {
  customWorkoutName: string;
  setCustomWorkoutName: (name: string) => void;
  selectedExercises: WorkoutExercise[];
  addExerciseToWorkout: (exTemplate: ExerciseTemplate) => void;
  addSetToExercise: (index: number) => void;
  updateSetValues: (
    exIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "done",
    value: string | boolean,
  ) => void;
  removeExerciseFromWorkout: (index: number) => void;
  cancelWorkout: () => void;
  saveWorkoutTemplate: () => Promise<void>;
}

// Типы шагов онбординга
export type QuestionType = "single" | "multiple" | "text";

export interface FitnessQuestionOption {
  label: string;
  value: string;
}

export interface FitnessQuestion {
  id: string;
  title: string;
  subtitle?: string;
  type: QuestionType;
  femaleOnly?: boolean;
  placeholder?: string;
  options?: FitnessQuestionOption[];
}

// Ответы спортивного онбординга
export type FitnessAnswers = Record<string, string | string[]>;

export interface FitnessProfile {
  completed: boolean;
  answers: FitnessAnswers;
  updated_at?: string;
}

// Программа тренировок, назначенная тренером (таблица assigned_programs)
export interface AssignedProgram {
  id: string;
  student_id: string;
  coach_id?: string;
  program_name: string;
  coach_notes?: string;
  is_active: boolean;
  workouts: WorkoutTemplate[];
  created_at: string;
}
