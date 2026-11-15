import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WorkoutExercise, ExerciseTemplate } from "@/types/workout";

interface ActiveWorkoutState {
  // Состояние отображения
  isWorkoutActive: boolean;
  isMinimized: boolean;

  // Данные тренировки
  customWorkoutName: string;
  selectedExercises: WorkoutExercise[];

  // Умный секундомер (устойчив к сворачиванию)
  isTimerStarted: boolean;
  startedAt: number | null; // Timestamp старта в мс

  // Таймер отдыха (устойчив к сворачиванию)
  restEndTime: number | null; // Timestamp окончания отдыха в мс

  // Экшены управления сессией
  startWorkoutSession: (name: string, exercises: WorkoutExercise[]) => void;
  startTimer: () => void;
  minimizeWorkout: () => void;
  maximizeWorkout: () => void;
  resetWorkoutSession: () => void;

  // Экшены управления упражнениями и сетами
  setCustomWorkoutName: (name: string) => void;
  addExercise: (exTemplate: ExerciseTemplate) => void;
  removeExercise: (exIndex: number) => void;
  addSet: (exIndex: number) => void;
  updateSet: (
    exIndex: number,
    setIndex: number,
    field: "reps" | "weight" | "done",
    value: string | boolean,
  ) => void;
  updateRestTime: (exIndex: number, newSeconds: number) => void;

  // Управление таймером отдыха
  setRestTimer: (seconds: number | null) => void;
  addRestSeconds: (seconds: number) => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set) => ({
      isWorkoutActive: false,
      isMinimized: false,
      customWorkoutName: "Моя тренировка",
      selectedExercises: [],
      isTimerStarted: false,
      startedAt: null,
      restEndTime: null,

      startWorkoutSession: (name, exercises) =>
        set({
          isWorkoutActive: true,
          isMinimized: false,
          customWorkoutName: name || "Моя тренировка",
          selectedExercises: exercises,
          isTimerStarted: false,
          startedAt: null,
          restEndTime: null,
        }),

      startTimer: () =>
        set({
          isTimerStarted: true,
          startedAt: Date.now(),
        }),

      minimizeWorkout: () => set({ isMinimized: true }),
      maximizeWorkout: () => set({ isMinimized: false }),

      resetWorkoutSession: () =>
        set({
          isWorkoutActive: false,
          isMinimized: false,
          customWorkoutName: "Моя тренировка",
          selectedExercises: [],
          isTimerStarted: false,
          startedAt: null,
          restEndTime: null,
        }),

      setCustomWorkoutName: (name) => set({ customWorkoutName: name }),

      addExercise: (exTemplate) =>
        set((state) => ({
          selectedExercises: [
            ...state.selectedExercises,
            {
              id: exTemplate.id,
              title: exTemplate.title,
              met: exTemplate.met,
              video_url: exTemplate.video_url,
              sets: [{ reps: "10", weight: "0", done: false }],
              rest_time: 90,
            },
          ],
        })),

      removeExercise: (exIndex) =>
        set((state) => ({
          selectedExercises: state.selectedExercises.filter(
            (_, idx) => idx !== exIndex,
          ),
        })),

      addSet: (exIndex) =>
        set((state) => ({
          selectedExercises: state.selectedExercises.map((ex, i) =>
            i === exIndex
              ? {
                  ...ex,
                  sets: [...ex.sets, { reps: "10", weight: "0", done: false }],
                }
              : ex,
          ),
        })),

      updateSet: (exIndex, setIndex, field, value) =>
        set((state) => ({
          selectedExercises: state.selectedExercises.map((ex, i) =>
            i === exIndex
              ? {
                  ...ex,
                  sets: ex.sets.map((s, sj) =>
                    sj === setIndex ? { ...s, [field]: value } : s,
                  ),
                }
              : ex,
          ),
        })),

      updateRestTime: (exIndex, newSeconds) =>
        set((state) => ({
          selectedExercises: state.selectedExercises.map((ex, i) =>
            i === exIndex ? { ...ex, rest_time: Math.max(0, newSeconds) } : ex,
          ),
        })),

      setRestTimer: (seconds) =>
        set({
          restEndTime: seconds !== null ? Date.now() + seconds * 1000 : null,
        }),

      addRestSeconds: (seconds) =>
        set((state) => ({
          restEndTime: state.restEndTime
            ? state.restEndTime + seconds * 1000
            : Date.now() + seconds * 1000,
        })),
    }),
    {
      name: "voltfit-active-workout-storage", // Ключ в localStorage
    },
  ),
);
