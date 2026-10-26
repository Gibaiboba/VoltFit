// Метаданные анбординга пользователя
export interface OnboardingMetadata {
  fitness_onboarding_completed: boolean;
  energy_level?: string;
  fitness_answers: Record<string, string>;
}

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
}

// Шаблон упражнения из статической базы данных (библиотеки)
export interface ExerciseTemplate {
  id: string;
  title: string;
  met: number;
  image: string;
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

// Пропсы для активной сессии (ActiveWorkoutSession)
export interface ActiveWorkoutSessionProps {
  customWorkoutName: string;
  selectedExercises: WorkoutExercise[];
  totalVolumeLoad: number;
  totalBurnedCalories: number;
  updateSetValues: (
    exIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "done",
    value: string | boolean,
  ) => void;
  addSetToExercise: (index: number) => void;
  removeExerciseFromWorkout: (index: number) => void;
  addExerciseToWorkout: (exTemplate: ExerciseTemplate) => void;
  finishActiveWorkout: (finalDuration: number) => Promise<void>;
  cancelWorkout: () => void;
}

// Пропсы для дашборда (WorkoutDashboard)
export interface WorkoutDashboardProps {
  onboardingMetadata: Partial<OnboardingMetadata>;
  userGlobalGoal: string;
  setIsCustomWorkoutActive: (active: boolean) => void;
  setIsActiveSessionActive: (active: boolean) => void;
  setSelectedExercises: (exercises: WorkoutExercise[]) => void;
  setCustomWorkoutName: (name: string) => void;
  resetFitnessOptions: () => void;
  savedTemplates?: WorkoutTemplate[];
}
export interface ActiveWorkoutSessionProps {
  customWorkoutName: string;
  selectedExercises: WorkoutExercise[];
  totalVolumeLoad: number;
  totalBurnedCalories: number;
  updateSetValues: (
    exIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "done",
    value: string | boolean,
  ) => void;
  addSetToExercise: (exIndex: number) => void;
  removeExerciseFromWorkout: (exIndex: number) => void;
  addExerciseToWorkout: (exercise: ExerciseTemplate) => void;
  finishActiveWorkout: (finalDuration: number) => Promise<void>;
  cancelWorkout: () => void;
}
