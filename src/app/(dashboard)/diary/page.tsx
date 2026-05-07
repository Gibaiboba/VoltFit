"use client";

import { useState, useMemo } from "react";
import { toISODate } from "@/lib/utils/date-utils";
import { useDiaryLogic } from "@/hooks/use-diary-logic";
import { DateNavigation } from "@/components/student/date-navigation";
import CaloriesBanner from "@/components/student/calories-banner";
import { MacroCard } from "@/components/student/macro-card";
import { MealCard } from "@/components/history/meal-card";
import FoodConstructor from "@/components/food/food-constructor";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import { Utensils, AlertCircle, Plus, List } from "lucide-react";

export default function DiaryPage() {
  const todayStr = useMemo(() => toISODate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<"constructor" | "list">(
    "constructor",
  );

  // Вся логика данных в одном хуке
  const {
    displayMeals,
    allMeals,
    consumed,
    goals,
    progress,
    isLoading,
    error,
    refetch,
    deleteMeal,
    removeItem,
  } = useDiaryLogic(selectedDate);

  // Вычисляем дни, в которых есть записи (для точек в календаре)
  const daysWithData = useMemo(() => {
    if (!allMeals) return [];
    return Array.from(new Set(allMeals.map((m) => m.created_at.split("T")[0])));
  }, [allMeals]);

  if (isLoading) return <HistorySkeleton />;

  if (error)
    return (
      <div className="mt-24 max-w-md mx-auto p-8 text-center bg-red-50 rounded-[40px] border border-red-100">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-red-900 font-black text-xl mb-2 italic">
          Ошибка загрузки
        </h2>
        <button
          onClick={() => refetch()}
          className="w-full py-4 bg-red-500 text-white rounded-full font-bold"
        >
          Попробовать снова
        </button>
      </div>
    );

  return (
    <div className="mt-24 max-w-4xl mx-auto p-6 lg:p-8 pb-32 space-y-8 animate-in fade-in duration-500">
      {/* ВЕРХНЯЯ СЕКЦИЯ */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Твой новый компонент навигации */}
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
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-400"
              }`}
            >
              <Plus size={14} /> Ввод
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                activeTab === "list"
                  ? "bg-slate-900 text-white shadow-lg"
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

        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            label="Белки"
            current={Math.round(consumed.p)}
            target={goals.p}
            colors={{
              stroke: "#ffbb54",
              bg: "bg-[#FFD700]/10",
              accent: "text-[#E6B800]",
            }}
          />
          <MacroCard
            label="Жиры"
            current={Math.round(consumed.f)}
            target={goals.f}
            colors={{
              stroke: "#3ca593",
              bg: "bg-[#4C9A2A]/10",
              accent: "text-[#2D5A1E]",
            }}
          />
          <MacroCard
            label="Углеводы"
            current={Math.round(consumed.c)}
            target={goals.c}
            colors={{
              stroke: "#F8FAFC",
              bg: "bg-slate-100",
              accent: "text-slate-900",
            }}
          />
        </div>
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
                  <Utensils className="mx-auto text-slate-200 mb-4" size={48} />
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
  );
}
