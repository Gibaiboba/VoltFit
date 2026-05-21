"use client";

import { useState, useMemo } from "react";
import { toISODate } from "@/lib/utils/date-utils";
import { useDiaryLogic } from "@/hooks/use-diary-logic";
import { useMacroStats } from "@/hooks/use-macro-stats";
import { useUserStore } from "@/store/useUserStore";
import { DateNavigation } from "@/components/student/date-navigation";
import CaloriesBanner from "@/components/student/calories-banner";
import { MacrosComboCard } from "@/components/student/macros-combo-card";
import { MealCard } from "@/components/history/meal-card";
import FoodConstructor from "@/components/food/food-constructor";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import AsyncBoundary from "@/components/shared/AsyncBoundary";
import { Utensils, Plus, List } from "lucide-react";

export default function DiaryPage() {
  const { selectedDate, setSelectedDate } = useUserStore();
  const todayStr = useMemo(() => toISODate(new Date()), []);
  const [activeTab, setActiveTab] = useState<"constructor" | "list">(
    "constructor",
  );

  // Вся логика данных инкапсулирована здесь
  const {
    displayMeals,
    allMeals,
    consumed,
    goals,
    progress,
    isLoading,
    isFetching,
    error,
    refetch,
    deleteMeal,
    removeItem,
  } = useDiaryLogic(selectedDate, todayStr);

  // Оптимизированный расчет макросов через вынесенный хук
  const macroStats = useMacroStats(goals, consumed);

  // Вычисляем дни, в которых есть записи
  const daysWithData = useMemo(() => {
    if (!allMeals) return [];
    return Array.from(
      new Set(allMeals.map((m) => toISODate(new Date(m.created_at)))),
    );
  }, [allMeals]);

  return (
    <AsyncBoundary
      // Загрузка включается только если данных в памяти ЕЩЕ НЕТ.
      // При фоновой дозагрузке архивного месяца страница больше не исчезает и не мерцает.
      isLoading={isLoading && allMeals.length === 0}
      error={error}
      onRetry={refetch}
      skeleton={<HistorySkeleton />}
    >
      <div className="mt-24 max-w-4xl mx-auto p-6 lg:p-8 pb-32 space-y-8 animate-in fade-in duration-500 relative text-slate-900">
        {/* Легкий аккуратный индикатор фонового обновления в углу, чтобы юзер понимал, что данные подтягиваются */}
        {isFetching && allMeals.length > 0 && (
          <div className="absolute top-4 right-6 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse pointer-events-none">
            ⏳ Обновление архива...
          </div>
        )}

        {/* ВЕРХНЯЯ СЕКЦИЯ */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="w-full md:w-auto">
              <DateNavigation
                selectedDate={selectedDate}
                todayStr={todayStr}
                isToday={selectedDate === todayStr}
                onDateChange={setSelectedDate}
                daysWithData={daysWithData}
              />
            </div>

            {/* Переключатель вкладок */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto h-fit">
              <button
                onClick={() => setActiveTab("constructor")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                  activeTab === "constructor"
                    ? "bg-slate-950 text-white shadow-lg"
                    : "text-slate-400"
                }`}
              >
                <Plus size={14} /> Ввод
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                  activeTab === "list"
                    ? "bg-slate-950 text-white shadow-lg"
                    : "text-slate-400"
                }`}
              >
                <List size={14} /> Записи
              </button>
            </div>
          </div>

          {/* Статистика */}
          <CaloriesBanner
            current={consumed.kcal}
            target={goals.kcal}
            progress={progress}
          />

          {/* Наша новая объединенная плашка макросов */}
          <MacrosComboCard macros={macroStats} />
        </section>

        {/* КОНТЕНТ ВКЛАДОК */}
        <div className="relative min-h-[400px]">
          {activeTab === "constructor" ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <FoodConstructor serverToday={selectedDate} />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-slate-900 uppercase italic">
                  История дня
                </h2>
                <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full uppercase">
                  {displayMeals.length} фиксаций
                </span>
              </div>

              <div className="space-y-4">
                {displayMeals.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                    <Utensils
                      className="mx-auto text-slate-200 mb-4"
                      size={48}
                    />
                    <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">
                      Пусто
                    </p>
                  </div>
                ) : (
                  displayMeals.map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onDelete={deleteMeal}
                      onRemoveItem={removeItem}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AsyncBoundary>
  );
}
