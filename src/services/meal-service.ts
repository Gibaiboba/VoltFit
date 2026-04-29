import { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import { SelectedProduct, MealType } from "@/types/food";

// Интерфейс для строки из таблицы user_meals
interface UserMealRow {
  id: string;
  user_id: string;
  meal_name: string;
  meal_type: MealType;
  items: SelectedProduct[]; // Типизируем наше JSON-поле
  total_kcal: number;
  total_p: number;
  total_f: number;
  total_c: number;
  created_at: string;
}

export const mealService = {
  async saveMealWithLog(
    supabase: SupabaseClient,
    userId: string,
    mealName: string,
    items: SelectedProduct[],
    date: string,
    mealType: MealType,
    mealId?: string | null,
  ): Promise<{ success: boolean; data: UserMealRow }> {
    const totals = this.calculateTotals(items);

    const { data: meal, error: mealError } = await supabase
      .from("user_meals")
      .upsert({
        ...(mealId ? { id: mealId } : {}),
        user_id: userId,
        meal_name: mealName.trim() || "Прием пищи",
        meal_type: mealType,
        items: items,
        total_kcal: Math.round(totals.kcal),
        total_p: Number(totals.p.toFixed(1)),
        total_f: Number(totals.f.toFixed(1)),
        total_c: Number(totals.c.toFixed(1)),
        created_at: mealId
          ? undefined
          : new Date(
              `${date}T${new Date().toLocaleTimeString("en-GB")}`,
            ).toISOString(),
      })
      .select()
      .single();

    if (mealError) throw new Error(`Ошибка сохранения: ${mealError.message}`);

    await this.updateDailyLog(supabase, userId, date);
    return { success: true, data: meal as UserMealRow };
  },

  calculateTotals(items: SelectedProduct[]) {
    return items.reduce(
      (acc, item) => {
        const factor = item.weight / 100;
        return {
          kcal: acc.kcal + item.kcal * factor,
          p: acc.p + (item.proteins || 0) * factor,
          f: acc.f + (item.fat || 0) * factor,
          c: acc.c + (item.carbs || 0) * factor,
        };
      },
      { kcal: 0, p: 0, f: 0, c: 0 },
    );
  },

  async updateDailyLog(
    supabase: SupabaseClient,
    userId: string,
    date: string,
  ): Promise<void> {
    const { data: allDayMeals, error: fetchError } = await supabase
      .from("user_meals")
      .select("total_kcal, total_p, total_f, total_c")
      .eq("user_id", userId)
      .gte("created_at", `${date}T00:00:00`)
      .lte("created_at", `${date}T23:59:59`);

    if (fetchError) {
      const err = fetchError as PostgrestError;
      console.error("Ошибка Supabase:", err.message);
      throw err;
    }
    const dailyTotals = (allDayMeals || []).reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.total_kcal || 0),
        p: acc.p + (m.total_p || 0),
        f: acc.f + (m.total_f || 0),
        c: acc.c + (m.total_c || 0),
      }),
      { kcal: 0, p: 0, f: 0, c: 0 },
    );

    const { error: upsertError } = await supabase.from("daily_logs").upsert(
      {
        user_id: userId,
        log_date: date,
        calories: Math.round(dailyTotals.kcal),
        proteins: Math.round(dailyTotals.p),
        fats: Math.round(dailyTotals.f),
        carbs: Math.round(dailyTotals.c),
      },
      { onConflict: "user_id,log_date" },
    );

    if (upsertError) throw upsertError;
  },

  async removeItemFromMeal(
    supabase: SupabaseClient,
    mealId: string,
    productId: string,
    userId: string,
    date: string,
  ): Promise<{ success: boolean }> {
    const { data, error: fetchError } = await supabase
      .from("user_meals")
      .select("*")
      .eq("id", mealId)
      .single();

    if (fetchError || !data) throw new Error("Прием пищи не найден");

    const meal = data as UserMealRow;

    // Типизированная фильтрация без any
    const updatedItems = meal.items.filter(
      (item) => (item.id || item.food_id) !== productId,
    );

    if (updatedItems.length === 0) {
      return await this.deleteMealWithLog(supabase, mealId, userId, date);
    }

    const totals = this.calculateTotals(updatedItems);

    const { error: updateError } = await supabase
      .from("user_meals")
      .update({
        items: updatedItems,
        total_kcal: Math.round(totals.kcal),
        total_p: Number(totals.p.toFixed(1)),
        total_f: Number(totals.f.toFixed(1)),
        total_c: Number(totals.c.toFixed(1)),
      })
      .eq("id", mealId);

    if (updateError) throw updateError;

    await this.updateDailyLog(supabase, userId, date);
    return { success: true };
  },

  async deleteMealWithLog(
    supabase: SupabaseClient,
    mealId: string,
    userId: string,
    date: string,
  ): Promise<{ success: boolean }> {
    const { error: deleteError } = await supabase
      .from("user_meals")
      .delete()
      .eq("id", mealId);

    if (deleteError) throw deleteError;

    await this.updateDailyLog(supabase, userId, date);
    return { success: true };
  },
};
