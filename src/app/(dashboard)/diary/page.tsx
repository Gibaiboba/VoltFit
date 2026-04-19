"use client";

import { useState, useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toISODate } from "@/lib/utils/date-utils";

// Компоненты
import CaloriesBanner from "@/components/student/calories-banner";
import { MacroCard } from "@/components/student/macro-card";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import FoodConstructor from "@/components/food/food-constructor";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import { Utensils, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { SavedMeal } from "@/types/food";

// 1. Описываем структуру того, что хотим получить на выходе
type Stats = { kcal: number; p: number; f: number; c: number };

interface DiaryData {
  consumed: Stats;
  progress: number;
  displayMeals: SavedMeal[];
}

export default function DiaryPage() {
  const { meals, isLoading, error, deleteMeal, refetch } = useMealHistory();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  // Тип string | null позволяет кнопке "Все" сбрасывать фильтр
  const [selectedDate, setSelectedDate] = useState<string | null>(
    toISODate(new Date()),
  );

  const goals = useMemo(
    () => ({
      kcal: profile?.daily_calories || 2000,
      p: profile?.protein || 0,
      f: profile?.fat || 0,
      c: profile?.carbs || 0,
    }),
    [profile],
  );

  const last14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    });
  }, []);

  // Основная логика фильтрации и статистики
  const diaryData = useMemo((): DiaryData => {
    // Указываем возвращаемый тип функции
    const stats: Stats = { kcal: 0, p: 0, f: 0, c: 0 };
    const mealsForDisplay: SavedMeal[] = [];

    meals.forEach((m) => {
      const isSameDate =
        toISODate(new Date(m.created_at)) ===
        (selectedDate || toISODate(new Date()));

      if (isSameDate) {
        stats.kcal += m.total_kcal || 0;
        stats.p += m.total_p || 0;
        stats.f += m.total_f || 0;
        stats.c += m.total_c || 0;
      }

      if (!selectedDate || isSameDate) {
        mealsForDisplay.push(m);
      }
    });

    return {
      consumed: stats,
      progress: Math.min((stats.kcal / goals.kcal) * 100, 100),
      displayMeals: mealsForDisplay.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    };
  }, [meals, selectedDate, goals]);

  if (isLoading || profileLoading) return <HistorySkeleton />;

  if (error) {
    return (
      <div className="mt-24 max-w-md mx-auto p-8 text-center bg-red-50 rounded-[40px] border border-red-100">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-red-900 font-black text-xl mb-2 italic">
          Ошибка загрузки
        </h2>
        <p className="text-red-600/60 text-sm mb-6">
          {error instanceof Error ? error.message : "Ошибка API"}
        </p>
        <button
          onClick={() => refetch()}
          className="w-full py-4 bg-red-500 text-white rounded-full font-bold"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="mt-24 max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      {/* 1. ШАПКА И КАЛЕНДАРЬ */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h1 className="text-3xl font-black text-slate-800 italic tracking-tight text-left">
            Дневник
          </h1>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-xs font-bold text-slate-500">
            <CalendarIcon size={14} className="text-blue-500" />
            {selectedDate
              ? selectedDate === toISODate(new Date())
                ? "Сегодня"
                : selectedDate
              : "Вся история"}
          </div>
        </div>

        <DateFilter
          days={last14Days}
          meals={meals}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />

        <CaloriesBanner
          current={diaryData.consumed.kcal}
          target={goals.kcal}
          progress={diaryData.progress}
        />

        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            label="Белки"
            current={Math.round(diaryData.consumed.p)}
            target={goals.p}
            colors={{
              color: "bg-orange-500",
              light: "bg-orange-50",
              text: "text-orange-600",
            }}
          />
          <MacroCard
            label="Жиры"
            current={Math.round(diaryData.consumed.f)}
            target={goals.f}
            colors={{
              color: "bg-rose-500",
              light: "bg-rose-50",
              text: "text-rose-600",
            }}
          />
          <MacroCard
            label="Углеводы"
            current={Math.round(diaryData.consumed.c)}
            target={goals.c}
            colors={{
              color: "bg-indigo-500",
              light: "bg-indigo-50",
              text: "text-indigo-600",
            }}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* 2. КОНСТРУКТОР (Всегда получает строку для сохранения) */}
        <div className="lg:col-span-7">
          <FoodConstructor
            serverToday={selectedDate || toISODate(new Date())}
          />
        </div>

        {/* 3. СПИСОК ПРИЕМОВ ПИЩИ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-800 uppercase italic">
              {selectedDate ? "Записи дня" : "Вся история"}
            </h2>
            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">
              {diaryData.displayMeals.length} записей
            </span>
          </div>

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {diaryData.displayMeals.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <Utensils className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-medium italic">
                  Здесь пока пусто
                </p>
              </div>
            ) : (
              diaryData.displayMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onDelete={async (id) => {
                    await deleteMeal(id);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
