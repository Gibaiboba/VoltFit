"use client";

import { useState, useMemo, useEffect } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import { Utensils, AlertCircle, RefreshCw, Plus, Target } from "lucide-react";
import Link from "next/link";
import { toISODate } from "@/lib/utils/date-utils";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
  const { meals, isLoading, error, refetch, deleteMeal } = useMealHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);

  // Загружаем дневную норму из базы данных
  useEffect(() => {
    async function fetchDailyGoal() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("daily_calories")
        .eq("id", user.id)
        .single();

      if (!error && data?.daily_calories) {
        setDailyGoal(data.daily_calories);
      }
    }
    fetchDailyGoal();
  }, []);

  // Считаем калории за выбранный день
  const dailyStats = useMemo(() => {
    const targetDate = selectedDate || toISODate(new Date());
    const totalConsumed = meals
      .filter((m) => toISODate(new Date(m.created_at)) === targetDate)
      .reduce((sum, m) => sum + (m.total_kcal || 0), 0);

    const goal = dailyGoal || 2000;
    const progress = Math.min((totalConsumed / goal) * 100, 100);
    const isOverLimit = totalConsumed > goal;

    return { totalConsumed, goal, progress, isOverLimit };
  }, [meals, selectedDate, dailyGoal]);

  const groupedMeals = useMemo(() => {
    const groups: Record<string, { displayDate: string; meals: typeof meals }> =
      {};
    meals.forEach((meal) => {
      const dateObj = new Date(meal.created_at);
      const isoKey = toISODate(dateObj);
      if (selectedDate && isoKey !== selectedDate) return;

      if (!groups[isoKey]) {
        groups[isoKey] = {
          displayDate: dateObj.toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          meals: [],
        };
      }
      groups[isoKey].meals.push(meal);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [meals, selectedDate]);

  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    });
  }, []);

  if (isLoading) return <HistorySkeleton />;

  if (error) {
    return (
      <div className="mt-20 max-w-md mx-auto p-8 text-center bg-red-50 rounded-[32px] border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-red-900 font-black text-xl mb-2">
          Ошибка загрузки
        </h2>
        <p className="text-red-600 text-sm mb-6">
          {error instanceof Error
            ? error.message
            : "Не удалось получить данные"}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 mx-auto px-8 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-200"
        >
          <RefreshCw size={18} /> Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="mt-20 max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          История
        </h1>
        <Link
          href="/products"
          className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold"
        >
          <Plus size={16} /> Новый расчет
        </Link>
      </div>

      {/* ВИДЖЕТ ПРОГРЕССА КАЛОРИЙ */}
      <div className="mb-8 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Target size={14} className="font-bold" />
              <p className="text-[11px] font-black uppercase tracking-widest">
                Прогресс дня{" "}
                {selectedDate
                  ? `(${new Date(selectedDate).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })})`
                  : ""}
              </p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-gray-900">
                {Math.round(dailyStats.totalConsumed)}
              </span>
              <span className="text-gray-400 font-bold">
                / {dailyStats.goal} ккал
              </span>
            </div>
          </div>
          <div
            className={`text-sm font-black px-3 py-1 rounded-lg ${dailyStats.isOverLimit ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}
          >
            {Math.round(dailyStats.progress)}%
          </div>
        </div>

        <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              dailyStats.isOverLimit ? "bg-red-500" : "bg-blue-600"
            }`}
            style={{ width: `${dailyStats.progress}%` }}
          />
        </div>
      </div>

      <DateFilter
        days={last14Days}
        meals={meals}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      {meals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Utensils className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">
            История пуста. Самое время что-нибудь съесть!
          </p>
        </div>
      ) : (
        <div className="space-y-10 mt-8">
          {groupedMeals.map(([isoKey, group]) => (
            <div key={isoKey} className="space-y-4">
              <div className="flex justify-between items-end px-2 border-b border-gray-100 pb-2">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  {group.displayDate}
                </h2>
                <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                  Всего:{" "}
                  {Math.round(
                    group.meals.reduce((sum, m) => sum + m.total_kcal, 0),
                  )}{" "}
                  ккал
                </div>
              </div>
              <div className="space-y-4">
                {group.meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} onDelete={deleteMeal} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
