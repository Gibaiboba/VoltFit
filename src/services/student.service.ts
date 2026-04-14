import { supabase } from "@/lib/supabase";
import { DailyLog } from "@/types/shared";
import { UserProfile } from "@/types/user";

export const studentService = {
  /**
   * Получить профиль студента
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  },

  /**
   * Получить логи студента за все время
   */
  async getLogs(userId: string): Promise<DailyLog[]> {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false });

    if (error) throw error;
    return data as DailyLog[];
  },

  /**
   * Сохранить или обновить лог за день
   */
  async saveLog(userId: string, logData: Partial<DailyLog>) {
    const { data, error } = await supabase
      .from("daily_logs")
      .upsert(
        {
          user_id: userId,
          ...logData,
        },
        {
          onConflict: "user_id, log_date", // Важно, чтобы не дублировать записи
        },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Получить историю приемов пищи (если есть отдельная таблица)
   */
  async getMealHistory(userId: string, date: string) {
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .eq("consumption_date", date);

    if (error) throw error;
    return data;
  },
};
