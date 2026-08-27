import { UserProfile } from "./user";
import { DailyLog } from "./shared";
import { UseMutationOptions } from "@tanstack/react-query";
import { SavedMeal } from "@/types/food";

export interface StudentData {
  student: UserProfile & {
    daily_logs: DailyLog[];
  };
}

export interface StudentView extends StudentData {
  weeklySteps: number;
}

export type AddStudentVariables = {
  email: string;
  coachId: string;
};

export type AddStudentOptions = UseMutationOptions<
  UserProfile,
  Error,
  AddStudentVariables
>;

export interface StudentDayRowProps {
  date: string;
  log?: DailyLog;
  meals: SavedMeal[];
  baseCalories: number;
  studentWeight: number;
  studentGender: string;
}
