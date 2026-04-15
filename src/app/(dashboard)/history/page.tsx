"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Utensils, AlertCircle, Plus } from "lucide-react";

// Хуки
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";

// Утилиты
import { toISODate } from "@/lib/utils/date-utils";

// Компоненты
import CaloriesBanner from "@/components/student/calories-banner";
import { MacroCard } from "@/components/student/macro-card";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import { HistorySkeleton } from "@/components/history/history-skeleton";

export default function HistoryPage() {
  const { meals, isLoading, error, refetch, deleteMeal } = useMealHistory();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 1. Цели пользователя
  const goals = useMemo(
    () => ({
      kcal: profile?.daily_calories || 2000,
      p: profile?.protein || 0,
      f: profile?.fat || 0,
      c: profile?.carbs || 0,
    }),
    [profile],
  );

  // 2. Статистика за выбранный день (для баннера и карточек БЖУ)
  const dailyStats = useMemo(() => {
    // Если дата не выбрана, считаем за "сегодня"
    const targetDate = selectedDate || toISODate(new Date());

    const dayMeals = meals.filter(
      (m) => toISODate(new Date(m.created_at)) === targetDate,
    );

    const consumed = dayMeals.reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.total_kcal || 0),
        p: acc.p + (m.total_p || 0),
        f: acc.f + (m.total_f || 0),
        c: acc.c + (m.total_c || 0),
      }),
      { kcal: 0, p: 0, f: 0, c: 0 },
    );

    const progress = Math.min((consumed.kcal / goals.kcal) * 100, 100);

    return { consumed, goals, progress };
  }, [meals, selectedDate, goals]);

  // 3. Группировка списка еды по дням
  const groupedMeals = useMemo(() => {
    const groups: Record<string, { displayDate: string; meals: typeof meals }> =
      {};

    meals.forEach((meal) => {
      const dateObj = new Date(meal.created_at);
      const isoKey = toISODate(dateObj);

      // Если выбран фильтр по дате, пропускаем остальные дни
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

  // 4. Последние 14 дней для фильтра
  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    });
  }, []);

  if (isLoading || profileLoading) return <HistorySkeleton />;

  if (error) {
    return (
      <div className="mt-20 max-w-md mx-auto p-8 text-center bg-red-50 rounded-[32px] border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-red-900 font-black text-xl mb-2 text-left">
          Ошибка загрузки
        </h2>
        <button
          onClick={() => refetch()}
          className="w-full py-4 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="mt-20 max-w-3xl mx-auto p-6 pb-20">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight text-left">
          История
        </h1>
        <Link
          href="/products"
          className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold transition-transform active:scale-95"
        >
          <Plus size={16} /> Новый расчет
        </Link>
      </div>

      {/* ВИДЖЕТ ПРОГРЕССА */}
      <div className="mb-10">
        <CaloriesBanner
          current={dailyStats.consumed.kcal}
          target={dailyStats.goals.kcal}
          progress={dailyStats.progress}
        />

        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            label="Белки"
            current={Math.round(dailyStats.consumed.p)}
            target={dailyStats.goals.p}
            colors={{
              color: "bg-orange-500",
              light: "bg-orange-50",
              text: "text-orange-600",
            }}
          />
          <MacroCard
            label="Жиры"
            current={Math.round(dailyStats.consumed.f)}
            target={dailyStats.goals.f}
            colors={{
              color: "bg-rose-500",
              light: "bg-rose-50",
              text: "text-rose-600",
            }}
          />
          <MacroCard
            label="Углеводы"
            current={Math.round(dailyStats.consumed.c)}
            target={dailyStats.goals.c}
            colors={{
              color: "bg-indigo-500",
              light: "bg-indigo-50",
              text: "text-indigo-600",
            }}
          />
        </div>
      </div>

      {/* ФИЛЬТР ПО ДНЯМ */}
      <DateFilter
        days={last14Days}
        meals={meals}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      {/* СПИСОК ЗАПИСЕЙ */}
      {groupedMeals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 mt-8">
          <Utensils className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">
            {selectedDate
              ? "В этот день записей не было"
              : "История пуста. Самое время что-нибудь съесть!"}
          </p>
        </div>
      ) : (
        <div className="space-y-10 mt-10">
          {groupedMeals.map(([isoKey, group]) => (
            <div key={isoKey} className="space-y-4">
              {/* Шапка группы (Дата + Итог дня) */}
              <div className="flex justify-between items-end px-4 border-b border-gray-100 pb-2">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">
                  {group.displayDate}
                </h2>
                <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">
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

              {/* Карточки приемов пищи */}
              <div className="space-y-4">
                {group.meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onDelete={async (id) => {
                      await deleteMeal(id);
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
