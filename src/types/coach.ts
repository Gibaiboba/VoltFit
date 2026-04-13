import { UserProfile } from "./user";
import { DailyLog } from "./shared";

export interface StudentData {
  student: UserProfile & {
    daily_logs: DailyLog[];
  };
}
