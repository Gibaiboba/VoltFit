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
   * Получить логи студента, начиная с определенной даты (для календаря и графиков дашборда)
   */
  async getLogsFromDate(userId: string, fromDate: string): Promise<DailyLog[]> {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", fromDate) // gte — Больше или равно (>=)
      .order("log_date", { ascending: false }); // Сортируем от свежих к старым

    if (error) throw error;
    return data || [];
  },

  /**
   * Получить логи студента порциями (пагинация для бесконечного скролла)
   * @param userId - ID пользователя
   * @param cursorDate - дата-курсор (запрашиваем логи строго СТАРШЕ этой даты)
   * @param limit - сколько логов подтянуть за один раз
   */
  async getLogsPaged(
    userId: string,
    cursorDate?: string,
    limit = 20,
  ): Promise<DailyLog[]> {
    let query = supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false }) // Сначала свежие, потом старые
      .limit(limit);

    // Если это не первая страница, запрашиваем логи строго ДО (меньше) даты-курсора
    if (cursorDate) {
      query = query.lt("log_date", cursorDate); // lt — Less Than (<)
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Сохранить или обновить лог за день
   */
  async saveLog(userId: string, logData: Partial<DailyLog>): Promise<DailyLog> {
    const { data, error } = await supabase
      .from("daily_logs")
      .upsert(
        { user_id: userId, ...logData },
        { onConflict: "user_id, log_date" },
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

  /**
   * Удалить детальную запись силовой тренировки из workout_logs
   */
  async deleteWorkoutLog(workoutLogId: string): Promise<void> {
    const { error } = await supabase
      .from("workout_logs")
      .delete()
      .eq("id", workoutLogId);

    if (error) throw error;
  },

  /**
   * Получить историю силовых тренировок ученика
   */
  async getWorkoutLogs(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Удалить тренировку из workout_logs и пересчитать расход в daily_logs
   */
  async deleteWorkoutLogAndSyncDaily(
    userId: string,
    workoutLogId: string,
  ): Promise<void> {
    // 1. Удаляем из workout_logs
    const { error: workoutError } = await supabase
      .from("workout_logs")
      .delete()
      .eq("id", workoutLogId);

    if (workoutError) throw workoutError;

    // 2. Находим день в daily_logs, где привязана эта тренировка
    const { data: userDailyLogs, error: fetchError } = await supabase
      .from("daily_logs")
      .select("id, activities")
      .eq("user_id", userId)
      .not("activities", "is", null);

    if (fetchError) throw fetchError;

    for (const dailyLog of userDailyLogs || []) {
      const currentActivities = Array.isArray(dailyLog.activities)
        ? dailyLog.activities
        : [];

      const updatedActivities = currentActivities.filter(
        (act: { workout_log_id?: string }) =>
          act.workout_log_id !== workoutLogId,
      );

      if (updatedActivities.length !== currentActivities.length) {
        const updatedBurnedCalories = updatedActivities.reduce(
          (sum: number, act: { burned_calories?: number }) =>
            sum + (Number(act.burned_calories) || 0),
          0,
        );

        const { error: updateError } = await supabase
          .from("daily_logs")
          .update({
            activities: updatedActivities,
            burned_calories: updatedBurnedCalories,
          })
          .eq("id", dailyLog.id);

        if (updateError) throw updateError;
      }
    }
  },
};
