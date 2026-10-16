import { Dispatch, SetStateAction, ChangeEvent } from "react";

export interface OnboardingMetadata {
  fitness_onboarding_completed: boolean;
  energy_level?: string;
  fitness_answers: Record<string, string>;
}

export interface WorkoutSet {
  reps: string;
  weight: string;
  done: boolean;
}

export interface WorkoutExercise {
  id: string;
  title: string;
  met: number;
  sets: WorkoutSet[];
}

export interface ExerciseTemplate {
  id: string;
  title: string;
  met: number;
  image: string;
}

export interface CustomWorkoutBuilderProps {
  customWorkoutName: string;
  setCustomWorkoutName: (name: string) => void;
  selectedExercises: WorkoutExercise[];
  setSelectedExercises: Dispatch<SetStateAction<WorkoutExercise[]>>;
  workoutDuration: number;
  totalVolumeLoad: number;
  totalBurnedCalories: number;
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
  setIsCustomWorkoutActive: (active: boolean) => void;
  handleDurationChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
