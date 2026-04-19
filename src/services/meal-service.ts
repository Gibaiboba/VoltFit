import { SupabaseClient } from "@supabase/supabase-js";
import { SelectedProduct } from "@/types/food";

export const mealService = {
  async saveMealWithLog(
    supabase: SupabaseClient,
    userId: string,
    mealName: string,
    items: SelectedProduct[],
    date: string,
  ) {
    // 1. Считаем итоги перед сохранением
    const totals = items.reduce(
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

    // 2. Сохраняем само блюдо
    const { data: meal, error: mealError } = await supabase
      .from("user_meals")
      .insert({
        user_id: userId,
        meal_name: mealName.trim() || "Прием пищи",
        items: items,
        total_kcal: Math.round(totals.kcal),
        total_p: Number(totals.p.toFixed(1)),
        total_f: Number(totals.f.toFixed(1)),
        total_c: Number(totals.c.toFixed(1)),
        created_at: new Date(
          `${date}T${new Date().toLocaleTimeString("en-GB")}`,
        ).toISOString(),
      })
      .select()
      .single();

    if (mealError) throw new Error(mealError.message);

    // 3. Обновляем суточный лог (daily_logs)
    const { data: dailyLog } = await supabase
      .from("daily_logs")
      .select("calories")
      .eq("user_id", userId)
      .eq("log_date", date)
      .maybeSingle();

    const newTotalKcal = Math.round(
      (dailyLog?.calories || 0) + meal.total_kcal,
    );

    const { error: upsertError } = await supabase.from("daily_logs").upsert(
      {
        user_id: userId,
        log_date: date,
        calories: newTotalKcal,
      },
      { onConflict: "user_id,log_date" },
    );

    if (upsertError) throw upsertError;

    return { success: true, data: meal };
  },
};
