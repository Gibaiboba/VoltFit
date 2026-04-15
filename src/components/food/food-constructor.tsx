"use client";

import { useState } from "react";
import { useProductSearch } from "@/hooks/use-product-search";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useMealStore } from "@/store/useMealStore";
import {
  Plus,
  Trash2,
  Scale,
  Loader2,
  Database,
  Save,
  Search,
  Utensils,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

export default function FoodConstructor({
  serverToday,
}: {
  serverToday: string;
}) {
  const [query, setQuery] = useState<string>("");
  const [mealName, setMealName] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: results = [], isLoading: isSearching } =
    useProductSearch(query);

  const {
    selectedItems,
    addItem,
    removeItem,
    updateWeight,
    getTotal,
    saveMeal,
    clearItems,
  } = useMealStore();

  const totals = getTotal();

  const saveMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Пожалуйста, войдите в систему");

      // Сохраняем блюдо с названием
      const result = await saveMeal(supabase, user.id, mealName);
      if (!result.success) throw new Error(result.error || "Ошибка сохранения");

      const today = serverToday;

      // Синхронизация с daily_logs
      const { data: allMeals } = await supabase
        .from("user_meals")
        .select("total_kcal")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      const totalKcal = (allMeals || []).reduce(
        (sum, m) => sum + (m.total_kcal || 0),
        0,
      );

      await supabase.from("daily_logs").upsert(
        {
          user_id: user.id,
          log_date: today,
          calories: Math.round(totalKcal),
        },
        { onConflict: "user_id,log_date" },
      );

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals-history"] });
      queryClient.invalidateQueries({ queryKey: ["student-logs"] });
      toast.success("Блюдо сохранено в историю! ✨");
      clearItems();
      setMealName("");
      setQuery("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Ошибка сохранения");
    },
  });

  return (
    <div className="mt-24 max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* ЛЕВАЯ ПАНЕЛЬ: ПОИСК */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2 text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Конструктор
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Найдите продукты в базе данных
          </p>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            className="w-full pl-12 pr-12 py-5 bg-white border border-slate-100 rounded-[28px] shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
            placeholder="Начните вводить название..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2
              className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
              size={20}
            />
          )}
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {results.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-black text-slate-700 leading-tight">
                    {product.name}
                  </p>
                  <Database size={12} className="text-blue-300" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {product.kcal} ккал / 100г
                </p>
              </div>
              <button
                onClick={() => {
                  addItem(product);
                  setQuery("");
                }}
                className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-90"
              >
                <Plus size={20} />
              </button>
            </div>
          ))}
          {query.length >= 2 && results.length === 0 && !isSearching && (
            <div className="text-center py-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
              <Utensils className="mx-auto text-slate-200 mb-2" size={32} />
              <p className="text-slate-400 text-sm italic">
                Ничего не нашли...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: ВАШЕ БЛЮДО */}
      <div className="lg:col-span-7 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-800">Состав блюда</h2>
          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            {selectedItems.length} поз.
          </span>
        </div>

        <div className="space-y-4 mb-10 min-h-[100px]">
          {selectedItems.length === 0 ? (
            <div className="py-16 text-center">
              <Utensils className="mx-auto text-slate-100 mb-4" size={64} />
              <p className="text-slate-300 font-medium italic">
                Ваше блюдо пока пусто...
              </p>
            </div>
          ) : (
            selectedItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50/50 p-5 rounded-3xl flex items-center gap-5 border border-slate-50 hover:bg-white hover:border-slate-100 transition-all"
              >
                <div className="flex-1 text-left">
                  <p className="font-black text-slate-700 mb-1">{item.name}</p>
                  <div className="flex gap-4">
                    <span className="text-[10px] font-black text-orange-400 uppercase">
                      Б: {(item.proteins * (item.weight / 100)).toFixed(1)}
                    </span>
                    <span className="text-[10px] font-black text-rose-400 uppercase">
                      Ж: {(item.fat * (item.weight / 100)).toFixed(1)}
                    </span>
                    <span className="text-[10px] font-black text-indigo-400 uppercase">
                      У: {(item.carbs * (item.weight / 100)).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center bg-white shadow-sm border border-slate-100 rounded-2xl px-4 py-2">
                  <Scale size={14} className="text-slate-300 mr-2" />
                  <input
                    type="number"
                    value={item.weight}
                    onChange={(e) =>
                      updateWeight(
                        item.id,
                        Math.max(0, parseFloat(e.target.value) || 0),
                      )
                    }
                    className="w-16 bg-transparent outline-none font-black text-slate-700 text-center"
                  />
                  <span className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    г
                  </span>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="space-y-6">
            {/* ПОЛЕ НАЗВАНИЯ */}
            <div className="relative group">
              <Tag
                className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Название (Обед, Смузи и т.д.)"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all font-bold text-slate-700"
              />
            </div>

            {/* ИТОГОВЫЙ БАННЕР */}
            <div className="bg-slate-900 rounded-[35px] p-8 text-white shadow-2xl relative overflow-hidden text-left">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                  Общая ценность
                </span>
                <div className="text-6xl font-black italic mt-1">
                  {Math.round(totals.kcal)}
                  <span className="text-xl opacity-30 ml-2 not-italic font-bold">
                    ккал
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-[9px] font-black opacity-40 uppercase mb-2">
                      Белки
                    </p>
                    <p className="text-xl font-black text-orange-400">
                      {totals.p.toFixed(1)}г
                    </p>
                  </div>
                  <div className="text-center border-x border-white/5">
                    <p className="text-[9px] font-black opacity-40 uppercase mb-2">
                      Жиры
                    </p>
                    <p className="text-xl font-black text-rose-400">
                      {totals.f.toFixed(1)}г
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black opacity-40 uppercase mb-2">
                      Углеводы
                    </p>
                    <p className="text-xl font-black text-indigo-400">
                      {totals.c.toFixed(1)}г
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[30px] shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
            >
              {saveMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {saveMutation.isPending ? "Сохранение..." : "Добавить в историю"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
