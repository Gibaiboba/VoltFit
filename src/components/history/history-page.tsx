"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Utensils, AlertCircle, Plus } from "lucide-react";
import { useDiaryLogic } from "@/hooks/use-diary-logic";
import { sortMeals } from "@/lib/utils/meal-utils";
import CaloriesBanner from "@/components/student/calories-banner";
import { MacroCard } from "@/components/student/macro-card";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import { HistorySkeleton } from "@/components/history/history-skeleton";

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Используем хук. Он даст все приемы пищи (allMeals) для группировки
  // и статистику (consumed, progress) для баннера по выбранной дате.
  const {
    allMeals,
    consumed,
    goals,
    progress,
    isLoading,
    error,
    refetch,
    deleteMeal,
  } = useDiaryLogic(selectedDate);

  // Группировка всех дней для списка истории
  const groupedMeals = useMemo(() => {
    if (!allMeals?.length) return [];

    const groups: Record<
      string,
      { displayDate: string; meals: typeof allMeals }
    > = {};

    allMeals.forEach((meal) => {
      const dateKey = meal.created_at.split("T")[0];
      // Если в DateFilter выбрана дата, показываем только её
      if (selectedDate && dateKey !== selectedDate) return;

      if (!groups[dateKey]) {
        groups[dateKey] = {
          displayDate: new Date(meal.created_at).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          meals: [],
        };
      }
      groups[dateKey].meals.push(meal);
    });

    // Сортируем еду внутри каждого дня
    Object.values(groups).forEach((group) => {
      group.meals = sortMeals(group.meals);
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [allMeals, selectedDate]);

  const last14Days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      }),
    [],
  );

  if (isLoading) return <HistorySkeleton />;

  if (error)
    return (
      <div className="mt-20 max-w-md mx-auto p-8 text-center bg-red-50 rounded-[32px]">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={32} />
        <h2 className="text-red-900 font-bold mb-4">Ошибка загрузки данных</h2>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-red-500 text-white rounded-full"
        >
          Повторить
        </button>
      </div>
    );

  return (
    <div className="mt-20 max-w-3xl mx-auto p-6 pb-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 italic uppercase">
          История
        </h1>
        <Link
          href="/diary"
          className="flex items-center gap-1 px-4 py-2 bg-slate-900 text-white rounded-full font-bold text-xs uppercase shadow-lg hover:scale-105 transition-transform"
        >
          <Plus size={16} /> В дневник
        </Link>
      </div>

      <div className="mb-10 space-y-6">
        <CaloriesBanner
          current={consumed.kcal}
          target={goals.kcal}
          progress={progress}
        />

        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            label="Белки"
            current={Math.round(consumed.p)}
            target={goals.p}
            colors={{
              stroke: "bg-orange-500",
              bg: "bg-orange-50",
              accent: "text-orange-600",
            }}
          />
          <MacroCard
            label="Жиры"
            current={Math.round(consumed.f)}
            target={goals.f}
            colors={{
              stroke: "bg-rose-500",
              bg: "bg-rose-50",
              accent: "text-rose-600",
            }}
          />
          <MacroCard
            label="Углеводы"
            current={Math.round(consumed.c)}
            target={goals.c}
            colors={{
              stroke: "bg-indigo-500",
              bg: "bg-indigo-50",
              accent: "text-indigo-600",
            }}
          />
        </div>
      </div>

      <DateFilter
        days={last14Days}
        meals={allMeals}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      {groupedMeals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 mt-8">
          <Utensils className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-bold italic uppercase text-xs tracking-widest">
            История пуста
          </p>
        </div>
      ) : (
        <div className="space-y-10 mt-10">
          {groupedMeals.map(([isoKey, group]) => (
            <div key={isoKey} className="space-y-4">
              <div className="flex justify-between items-end px-4 border-b border-gray-100 pb-2">
                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  {group.displayDate}
                </h2>
                <div className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase">
                  Итого:{" "}
                  {Math.round(
                    group.meals.reduce(
                      (sum, m) => sum + (m.total_kcal || 0),
                      0,
                    ),
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
