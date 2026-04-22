import { supabase } from "@/lib/supabase";
import { DailyLog } from "@/types/shared";
import { UserProfile } from "@/types/user";
import { SavedMeal } from "@/types/food";

export const studentService = {
  /**
   * Получить профиль студента
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(); // Возвращает null вместо ошибки, если запись не найдена

    // 1. Проверяем системную ошибку (сеть, права доступа и т.д.)
    if (error) throw error;

    // 2. Валидируем наличие данных
    if (!data) {
      throw new Error("Профиль не найден. Пожалуйста, завершите регистрацию.");
    }

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
      .order("log_date", { ascending: false })
      .limit(100); // Ограничиваем, чтобы не грузить лишнего

    if (error) throw error;
    return data || []; // Гарантируем массив
  },
  /**
   * Сохранить или обновить лог за день
   */
  async saveLog(userId: string, logData: Partial<DailyLog>) {
    const { data, error } = await supabase
      .from("daily_logs")
      .upsert(
        { user_id: userId, ...logData },
        {
          onConflict: "user_id, log_date",
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Получить приемы пищи с определенной даты (для оптимизации кэша)
   */
  async getMealHistory(
    userId: string,
    fromDate?: string,
  ): Promise<SavedMeal[]> {
    let query = supabase
      .from("user_meals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Если дата передана, берем данные ОТ нее
    if (fromDate) {
      query = query.gte("created_at", fromDate);
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },
};
