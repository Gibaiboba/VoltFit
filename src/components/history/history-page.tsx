"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Utensils, Plus } from "lucide-react";
import { useDiaryLogic } from "@/hooks/use-diary-logic";
import { sortMeals } from "@/lib/utils/meal-utils";
import { toISODate } from "@/lib/utils/date-utils"; // Импортируем утилиту дат
import CaloriesBanner from "@/components/student/calories-banner";
import { MacroCard } from "@/components/student/macros-combo-card";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import AsyncBoundary from "@/components/shared/AsyncBoundary"; // Наш единый контейнер
import { MACRO_CONFIG } from "@/constants/nutrition";

export default function HistoryPage() {
  const todayStr = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ИСПРАВЛЕНО: Защищаем хук от null, передавая todayStr в качестве fallback
  const {
    allMeals,
    consumed,
    goals,
    progress,
    isLoading,
    error,
    refetch,
    deleteMeal,
  } = useDiaryLogic(selectedDate ?? todayStr);

  // Группировка всех дней для списка истории
  const groupedMeals = useMemo(() => {
    if (!allMeals?.length) return [];

    const groups: Record<
      string,
      { displayDate: string; meals: typeof allMeals }
    > = {};

    allMeals.forEach((meal) => {
      // ИСПРАВЛЕНО: Используем консистентный toISODate вместо небезопасного split("T")
      const dateKey = toISODate(new Date(meal.created_at));

      // Если в DateFilter выбрана конкретная дата, показываем только её
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

  return (
    <AsyncBoundary
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      skeleton={<HistorySkeleton />}
    >
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

          {/* ИСПРАВЛЕНО: Убрали Math.round и старые цвета, внедрили MACRO_CONFIG */}
          <div className="grid grid-cols-3 gap-3">
            <MacroCard
              label={MACRO_CONFIG.p.label}
              current={consumed.p}
              target={goals.p}
              colors={MACRO_CONFIG.p.colors}
            />
            <MacroCard
              label={MACRO_CONFIG.f.label}
              current={consumed.f}
              target={goals.f}
              colors={MACRO_CONFIG.f.colors}
            />
            <MacroCard
              label={MACRO_CONFIG.c.label}
              current={consumed.c}
              target={goals.c}
              colors={MACRO_CONFIG.c.colors}
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
    </AsyncBoundary>
  );
}
