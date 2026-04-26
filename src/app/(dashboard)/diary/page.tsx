"use client";

import { useState, useMemo, useRef } from "react";
import { useMealHistory } from "@/hooks/use-meal-history";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toISODate } from "@/lib/utils/date-utils";

// Компоненты
import CaloriesBanner from "@/components/student/calories-banner";
import { MacroCard } from "@/components/student/macro-card";
import { MealCard } from "@/components/history/meal-card";
import FoodConstructor from "@/components/food/food-constructor";
import { HistorySkeleton } from "@/components/history/history-skeleton";
import {
  Utensils,
  AlertCircle,
  Calendar as CalendarIcon,
  Plus,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SavedMeal } from "@/types/food";

type Stats = { kcal: number; p: number; f: number; c: number };

interface DiaryData {
  consumed: Stats;
  progress: number;
  displayMeals: SavedMeal[];
}

export default function DiaryPage() {
  const { meals, isLoading, error, deleteMeal, refetch } = useMealHistory();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Функция для открытия выбора даты
  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker(); // Открывает системный календарь
  };

  const [activeTab, setActiveTab] = useState<"constructor" | "list">(
    "constructor",
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    toISODate(new Date()),
  );

  // Логика переключения даты (вперед/назад)
  const shiftDate = (amount: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + amount);
    setSelectedDate(toISODate(current));
  };

  const goals = useMemo(
    () => ({
      kcal: profile?.daily_calories || 2000,
      p: profile?.protein || 0,
      f: profile?.fat || 0,
      c: profile?.carbs || 0,
    }),
    [profile],
  );

  const diaryData = useMemo((): DiaryData => {
    const stats: Stats = { kcal: 0, p: 0, f: 0, c: 0 };
    const mealsForDisplay: SavedMeal[] = [];

    meals.forEach((m) => {
      const mealDate = toISODate(new Date(m.created_at));
      const isSameDate = mealDate === selectedDate;

      if (isSameDate) {
        stats.kcal += m.total_kcal || 0;
        stats.p += m.total_p || 0;
        stats.f += m.total_f || 0;
        stats.c += m.total_c || 0;
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
    <div className="mt-24 max-w-4xl mx-auto p-6 lg:p-8 pb-32 space-y-8 animate-in fade-in duration-500">
      {/* ШАПКА И КАЛЕНДАРЬ */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* НОВЫЙ КАЛЕНДАРЬ С ВЫБОРОМ ДАТЫ */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 shadow-lg">
              <button
                onClick={() => shiftDate(-1)}
                className="text-yellow-400 hover:bg-slate-800 p-1.5 rounded-full transition-all active:scale-90"
              >
                <ChevronLeft size={16} strokeWidth={3} />
              </button>

              {/* Кликабельный центр с выбором даты */}
              <div
                onClick={handleCalendarClick}
                className="flex items-center gap-2 px-2 min-w-[110px] justify-center cursor-pointer hover:bg-white/5 rounded-lg transition-colors relative"
              >
                <CalendarIcon size={14} className="text-yellow-400/80" />
                <span className="text-xs font-black tracking-wide text-slate-100 uppercase whitespace-nowrap">
                  {selectedDate === toISODate(new Date())
                    ? "Сегодня"
                    : new Date(selectedDate).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                      })}
                </span>

                {/* Скрытый нативный инпут */}
                <input
                  ref={dateInputRef}
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <button
                onClick={() => shiftDate(1)}
                className="text-yellow-400 hover:bg-slate-800 p-1.5 rounded-full transition-all active:scale-90"
              >
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
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
              stroke: "#ffbb54",
              bg: "bg-[#FFD700]/10",
              accent: "text-[#E6B800]",
            }}
          />
          <MacroCard
            label="Жиры"
            current={Math.round(diaryData.consumed.f)}
            target={goals.f}
            colors={{
              stroke: "#3ca593",
              bg: "bg-[#4C9A2A]/10",
              accent: "text-[#2D5A1E]",
            }}
          />
          <MacroCard
            label="Углеводы"
            current={Math.round(diaryData.consumed.c)}
            target={goals.c}
            colors={{
              stroke: "#F8FAFC",
              bg: "bg-slate-100",
              accent: "text-slate-900",
            }}
          />
        </div>
      </section>

      {/* ОСНОВНОЙ КОНТЕНТ */}
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
              <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-full">
                {diaryData.displayMeals.length} ФИКСАЦИЙ
              </span>
            </div>

            <div className="space-y-4">
              {diaryData.displayMeals.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                  <Utensils className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">
                    Пусто
                  </p>
                </div>
              ) : (
                diaryData.displayMeals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} onDelete={deleteMeal} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
