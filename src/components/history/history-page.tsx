"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Utensils, AlertCircle, Plus } from "lucide-react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toISODate } from "@/lib/utils/date-utils";
import CaloriesBanner from "@/components/student/calories-banner";
import { MacroCard } from "@/components/student/macro-card";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import { HistorySkeleton } from "@/components/history/history-skeleton";

const MEAL_ORDER: Record<string, number> = {
  breakfast: 1,
  lunch: 2,
  dinner: 3,
  snack: 4,
};

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // Получаем данные
  const {
    meals,
    isLoading: mealsLoading,
    error,
    refetch,
    deleteMeal,
  } = useMealHistory(undefined, selectedDate || undefined);
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  // 1. Цели (с защитой от пустых данных)
  const goals = useMemo(
    () => ({
      kcal: profile?.daily_calories || 2000,
      p: profile?.protein || 0,
      f: profile?.fat || 0,
      c: profile?.carbs || 0,
    }),
    [profile],
  );

  // 2. Группировка и СОРТИРОВКА (основная логика тут)
  const groupedMeals = useMemo(() => {
    // Если данных еще нет, возвращаем пустой массив
    if (!meals || meals.length === 0) return [];

    const groups: Record<string, { displayDate: string; meals: typeof meals }> =
      {};

    meals.forEach((meal) => {
      const dateObj = new Date(meal.created_at);
      const isoKey = toISODate(dateObj);

      // Фильтр по выбранной дате (если она выбрана)
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

    // Сортируем приемы пищи внутри каждого дня
    Object.values(groups).forEach((group) => {
      group.meals.sort((a, b) => {
        const orderA = MEAL_ORDER[a.meal_type] || 99;
        const orderB = MEAL_ORDER[b.meal_type] || 99;

        if (orderA !== orderB) {
          return orderA - orderB; // Сначала Завтрак, потом Обед
        }

        // Если типы одинаковые (два перекуса), сортируем по времени создания
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    });

    // Сортируем сами дни (от новых к старым)
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [meals, selectedDate]);

  // 3. Статистика за выбранный день для баннера
  const dailyStats = useMemo(() => {
    const targetDate = selectedDate || toISODate(new Date());
    const dayGroup = groupedMeals.find(([date]) => date === targetDate);
    const dayMeals = dayGroup ? dayGroup[1].meals : [];

    const consumed = dayMeals.reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.total_kcal || 0),
        p: acc.p + (m.total_p || 0),
        f: acc.f + (m.total_f || 0),
        c: acc.c + (m.total_c || 0),
      }),
      { kcal: 0, p: 0, f: 0, c: 0 },
    );

    return {
      consumed,
      progress: Math.min((consumed.kcal / goals.kcal) * 100, 100),
    };
  }, [groupedMeals, selectedDate, goals]);

  // Список последних 14 дней
  const last14Days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
      }),
    [],
  );

  // Если идет первичная загрузка
  if (mealsLoading || profileLoading) return <HistorySkeleton />;

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
    <div className="mt-20 max-w-3xl mx-auto p-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">История</h1>
        <Link
          href="/products"
          className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold"
        >
          <Plus size={16} /> Новый расчет
        </Link>
      </div>

      <div className="mb-10">
        <CaloriesBanner
          current={dailyStats.consumed.kcal}
          target={goals.kcal}
          progress={dailyStats.progress}
        />
        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            label="Белки"
            current={Math.round(dailyStats.consumed.p)}
            target={goals.p}
            colors={{
              stroke: "bg-orange-500",
              bg: "bg-orange-50",
              accent: "text-orange-600",
            }}
          />
          <MacroCard
            label="Жиры"
            current={Math.round(dailyStats.consumed.f)}
            target={goals.f}
            colors={{
              stroke: "bg-rose-500",
              bg: "bg-rose-50",
              accent: "text-rose-600",
            }}
          />
          <MacroCard
            label="Углеводы"
            current={Math.round(dailyStats.consumed.c)}
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
        meals={meals}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      {groupedMeals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 mt-8">
          <Utensils className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">История пуста</p>
        </div>
      ) : (
        <div className="space-y-10 mt-10">
          {groupedMeals.map(([isoKey, group]) => (
            <div key={isoKey} className="space-y-4">
              <div className="flex justify-between items-end px-4 border-b pb-2">
                <h2 className="text-xs font-black text-gray-400 uppercase">
                  {group.displayDate}
                </h2>
                <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                  Всего:{" "}
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
