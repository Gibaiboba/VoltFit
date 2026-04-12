"use client";
import { useState, useMemo } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { MealCard } from "@/components/history/meal-card";
import { DateFilter } from "@/components/history/date-filter";
import { Utensils, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { toISODate } from "@/lib/utils/date-utils";
import { HistorySkeleton } from "@/components/history/history-skeleton";

export default function HistoryPage() {
  const { meals, isLoading, error, refetch, deleteMeal } = useMealHistory();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useUserProfile();

  const goals = useMemo(
    () => ({
      kcal: profile?.daily_calories || 2000,
      p: profile?.protein || 0,
      f: profile?.fat || 0,
      c: profile?.carbs || 0,
    }),
    [profile],
  );

  // 2. Считаем детальную статистику за выбранный день (Ккал + БЖУ)
  const dailyStats = useMemo(() => {
    const targetDate = selectedDate || toISODate(new Date());

    // Фильтруем приемы пищи за этот день
    const dayMeals = meals.filter(
      (m) => toISODate(new Date(m.created_at)) === targetDate,
    );

    // Суммируем нутриенты
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
    const isOverLimit = consumed.kcal > goals.kcal;

    return { consumed, goals, progress, isOverLimit };
  }, [meals, selectedDate, goals]);

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

  if (isLoading || profileLoading) return <HistorySkeleton />;

  if (error) {
    return (
      <div className="mt-20 max-w-md mx-auto p-8 text-center bg-red-50 rounded-[32px] border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-red-900 font-black text-xl mb-2">
          Ошибка загрузки
        </h2>
        <button
          onClick={() => refetch()}
          className="px-8 py-3 bg-red-500 text-white rounded-full font-bold"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="mt-20 max-w-3xl mx-auto p-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight text-left">
          История
        </h1>
        <Link
          href="/products"
          className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold"
        >
          <Plus size={16} /> Новый расчет
        </Link>
      </div>

      {/* ВИДЖЕТ ПРОГРЕССА (ОБНОВЛЕННЫЙ) */}
      <div className="mb-8 p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-8">
        {/* КАРТОЧКА КАЛОРИЙ (ЧЕРНАЯ) */}
        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="flex justify-between items-end relative z-10">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">
                Ккал сегодня
              </p>
              <div className="text-5xl font-black italic tracking-tighter leading-none">
                {Math.round(dailyStats.consumed.kcal)}
                <span className="text-xl opacity-30 not-italic ml-2 font-bold">
                  / {dailyStats.goals.kcal}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 text-right">
                Осталось
              </p>
              <p className="text-3xl font-black text-emerald-400 italic leading-none">
                {Math.max(
                  0,
                  dailyStats.goals.kcal - Math.round(dailyStats.consumed.kcal),
                )}
              </p>
            </div>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full mt-6 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${dailyStats.isOverLimit ? "bg-red-500" : "bg-blue-500"}`}
              style={{ width: `${dailyStats.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Белки",
              cur: dailyStats.consumed.p,
              target: dailyStats.goals.p,
              color: "bg-orange-500",
              light: "bg-orange-50",
              text: "text-orange-600",
            },
            {
              label: "Жиры",
              cur: dailyStats.consumed.f,
              target: dailyStats.goals.f,
              color: "bg-rose-500",
              light: "bg-rose-50",
              text: "text-rose-600",
            },
            {
              label: "Углеводы",
              cur: dailyStats.consumed.c,
              target: dailyStats.goals.c,
              color: "bg-indigo-500",
              light: "bg-indigo-50",
              text: "text-indigo-600",
            },
          ].map((m) => {
            // 1. Считаем процент для полоски
            const proc = m.target > 0 ? (m.cur / m.target) * 100 : 0;

            return (
              <div
                key={m.label}
                className={`${m.light} p-4 rounded-[32px] border border-white shadow-sm flex flex-col items-center`}
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 text-center">
                  {m.label}
                </span>

                {/* 2. ИЗМЕНЕНИЕ: Теперь выводим СЪЕДЕНО (m.cur) вместо остатка */}
                <div className={`text-2xl font-black italic ${m.text}`}>
                  {Math.round(m.cur)}
                  <span className="text-[10px] not-italic ml-0.5 opacity-60">
                    г
                  </span>
                </div>

                {/* 3. Подпись цели */}
                <p className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">
                  из {m.target}г план
                </p>

                {/* Прогресс-бар */}
                <div className="w-full h-1 bg-white rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full ${m.color} transition-all duration-700`}
                    style={{ width: `${Math.min(proc, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DateFilter
        days={last14Days}
        meals={meals}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      {meals.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 mt-8">
          <Utensils className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">
            История пуста. Самое время что-нибудь съесть!
          </p>
        </div>
      ) : (
        <div className="space-y-10 mt-10">
          {groupedMeals.map(([isoKey, group]) => (
            <div key={isoKey} className="space-y-4">
              <div className="flex justify-between items-end px-4 border-b border-gray-100 pb-2">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {group.displayDate}
                </h2>
                <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                  Всего:{" "}
                  {Math.round(
                    group.meals.reduce((sum, m) => sum + m.total_kcal, 0),
                  )}{" "}
                  ккал
                </div>
              </div>
              <div className="space-y-4">
                {group.meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onDelete={async (id) => {
                      deleteMeal(id);
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
