"use client";

import { useState, useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import { Utensils, AlertCircle, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import { toISODate } from "@/lib/utils/date-utils";
import { HistorySkeleton } from "@/components/history/history-skeleton";

export default function HistoryPage() {
  const { meals, isLoading, error, refetch, deleteMeal } = useMealHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const groupedMeals = useMemo(() => {
    const groups: Record<string, { displayDate: string; meals: typeof meals }> =
      {};

    meals.forEach((meal) => {
      const dateObj = new Date(meal.created_at);
      const isoKey = toISODate(dateObj);

      // Если фильтр включен и дата не совпадает — пропускаем
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

    // Сортируем группы по убыванию даты (чтобы свежие были сверху)
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [meals, selectedDate]);

  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    });
  }, []);

  if (isLoading) {
    return <HistorySkeleton />;
  }

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
          onClick={() => refetch()}
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
        days={last14Days}
        meals={meals} // Передаем все приемы пищи для проверки галочек
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
