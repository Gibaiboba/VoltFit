import { UserProfile } from "./user";
import { DailyLog } from "./shared";
import { UseMutationOptions } from "@tanstack/react-query";

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
