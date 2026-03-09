"use client";

import { useState, useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import { Utensils, Loader2, AlertCircle, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { meals, isLoading, error, refetch, deleteMeal } = useMealHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Логика группировки (чистые данные)
  const allDates = useMemo(() => {
    const dates = meals.map((m) =>
      new Date(m.created_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      }),
    );
    return Array.from(new Set(dates));
  }, [meals]);

  const groupedMeals = useMemo(() => {
    const groups: Record<string, typeof meals> = {};
    meals.forEach((meal) => {
      const fullDate = new Date(meal.created_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const shortDate = new Date(meal.created_at).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });

      if (selectedDate && shortDate !== selectedDate) return;
      if (!groups[fullDate]) groups[fullDate] = [];
      groups[fullDate].push(meal);
    });
    return Object.entries(groups);
  }, [meals, selectedDate]);

  // 1. Состояние загрузки
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
        <Loader2 className="animate-spin mb-2 text-blue-500" size={32} />
        <p className="animate-pulse">Загружаем вашу историю...</p>
      </div>
    );
  }

  // 2. Состояние ОШИБКИ (вот тут используем AlertCircle и RefreshCw)
  if (error) {
    return (
      <div className="mt-20 max-w-md mx-auto p-8 text-center bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
        <h2 className="text-red-900 font-bold mb-2">Произошла ошибка</h2>
        <p className="text-red-600 text-sm mb-6">
          {error instanceof Error
            ? error.message
            : "Не удалось загрузить данные"}
        </p>
        <button
          onClick={() => refetch()} // Вызываем повторный запрос
          className="flex items-center gap-2 mx-auto px-6 py-2 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all"
        >
          <RefreshCw size={16} /> Попробовать снова
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

      <DateFilter
        dates={allDates}
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
        <div className="space-y-10">
          {groupedMeals.map(([date, dayMeals]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-between items-end px-2 border-b border-gray-100 pb-2">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  {date}
                </h2>
                <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                  Всего:{" "}
                  {Math.round(
                    dayMeals.reduce((sum, m) => sum + m.total_kcal, 0),
                  )}{" "}
                  ккал
                </div>
              </div>
              <div className="space-y-4">
                {dayMeals.map((meal) => (
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
